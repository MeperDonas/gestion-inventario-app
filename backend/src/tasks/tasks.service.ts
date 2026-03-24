import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  TaskEventType,
  TaskStatus,
  type User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

type AuthenticatedActor = Pick<User, 'id' | 'role'>;

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  createdById: true,
  assignedToId: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: {
      id: true,
      name: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const taskEventSelect = {
  id: true,
  taskId: true,
  type: true,
  fromStatus: true,
  toStatus: true,
  note: true,
  createdById: true,
  createdAt: true,
  createdBy: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
  PENDING: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  IN_PROGRESS: ['PENDING', 'COMPLETED', 'CANCELLED'],
  COMPLETED: ['PENDING', 'IN_PROGRESS'],
  CANCELLED: ['PENDING', 'IN_PROGRESS'],
};

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actor: AuthenticatedActor, dto: CreateTaskDto) {
    await this.ensureUserExists(actor.id);
    await this.ensureAssignableUser(dto.assignedToId);

    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          createdBy: {
            connect: { id: actor.id },
          },
          ...(dto.assignedToId
            ? {
                assignedTo: {
                  connect: { id: dto.assignedToId },
                },
              }
            : {}),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        },
        select: taskSelect,
      });

      await tx.taskEvent.create({
        data: {
          taskId: task.id,
          type: TaskEventType.CREATED,
          fromStatus: null,
          toStatus: task.status,
          note: dto.description?.trim() || null,
          createdById: actor.id,
        },
      });

      return task;
    });
  }

  async findAll(actor: AuthenticatedActor, query: QueryTasksDto) {
    const andFilters: Prisma.TaskWhereInput[] = [
      { deletedAt: null },
      this.buildVisibilityWhere(actor),
    ];

    if (query.status) {
      andFilters.push({ status: query.status });
    }

    if (!query.includeCompleted && !query.status) {
      andFilters.push({ status: { not: TaskStatus.COMPLETED } });
    }

    if (query.search) {
      andFilters.push({
        OR: [
          {
            title: {
              contains: query.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: query.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      });
    }

    const where: Prisma.TaskWhereInput = {
      AND: andFilters,
    };

    return this.prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      take: query.limit ?? 12,
      select: taskSelect,
    });
  }

  async findOne(taskId: string, actor: AuthenticatedActor) {
    return this.findVisibleTaskOrThrow(taskId, actor);
  }

  async update(taskId: string, actor: AuthenticatedActor, dto: UpdateTaskDto) {
    const task = await this.findVisibleTaskOrThrow(taskId, actor);
    if (task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    if (dto.assignedToId !== undefined) {
      await this.ensureAssignableUser(dto.assignedToId);
    }

    const data = {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description === null ? null : dto.description.trim() }
        : {}),
      ...(dto.assignedToId !== undefined
        ? dto.assignedToId === null
          ? { assignedTo: { disconnect: true } }
          : { assignedTo: { connect: { id: dto.assignedToId } } }
        : {}),
      ...(dto.dueDate !== undefined
        ? { dueDate: dto.dueDate === null ? null : new Date(dto.dueDate) }
        : {}),
    };

    if (Object.keys(data).length === 0) {
      return this.prisma.task.findUniqueOrThrow({
        where: { id: taskId },
        select: taskSelect,
      });
    }

    const updateNote = this.buildUpdateNote(dto);

    return this.prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data,
        select: taskSelect,
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          type: TaskEventType.UPDATED,
          fromStatus: updatedTask.status,
          toStatus: updatedTask.status,
          note: updateNote,
          createdById: actor.id,
        },
      });

      return updatedTask;
    });
  }

  async updateStatus(taskId: string, actor: AuthenticatedActor, dto: UpdateTaskStatusDto) {
    const task = await this.findVisibleTaskOrThrow(taskId, actor);
    if (!this.isValidTransition(task.status, dto.status)) {
      throw new BadRequestException(
        `Invalid task status transition from ${task.status} to ${dto.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: { status: dto.status },
        select: taskSelect,
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          type: TaskEventType.STATUS_CHANGED,
          fromStatus: task.status,
          toStatus: dto.status,
          note: dto.note?.trim() || null,
          createdById: actor.id,
        },
      });

      return updatedTask;
    });
  }

  async getTimeline(taskId: string, actor: AuthenticatedActor) {
    await this.findVisibleTaskOrThrow(taskId, actor);

    return this.prisma.taskEvent.findMany({
      where: { taskId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: taskEventSelect,
    });
  }

  async remove(taskId: string, actor: AuthenticatedActor) {
    const task = await this.findVisibleTaskOrThrow(taskId, actor);
    if (task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: taskId },
        data: { deletedAt: new Date() },
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          type: TaskEventType.DELETED,
          fromStatus: task.status,
          toStatus: task.status,
          note: 'Task deleted from dashboard',
          createdById: actor.id,
        },
      });

      return { message: 'Task deleted successfully' };
    });
  }

  private async findVisibleTaskOrThrow(taskId: string, actor: AuthenticatedActor) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        ...this.buildVisibilityWhere(actor),
      },
      select: {
        ...taskSelect,
        deletedAt: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private buildVisibilityWhere(actor: AuthenticatedActor): Prisma.TaskWhereInput {
    if (actor.role === 'ADMIN') {
      return {};
    }

    return {
      OR: [{ createdById: actor.id }, { assignedToId: actor.id }],
    };
  }

  private isValidTransition(current: TaskStatus, next: TaskStatus) {
    if (current === next) {
      return false;
    }

    return allowedTransitions[current].includes(next);
  }

  private buildUpdateNote(dto: UpdateTaskDto) {
    const changes: string[] = [];

    if (dto.title !== undefined) {
      changes.push('title');
    }
    if (dto.description !== undefined) {
      changes.push('description');
    }
    if (dto.assignedToId !== undefined) {
      changes.push('assignee');
    }
    if (dto.dueDate !== undefined) {
      changes.push('due date');
    }

    return changes.length > 0 ? `Updated ${changes.join(', ')}` : null;
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async ensureAssignableUser(userId?: string | null) {
    if (!userId) {
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, active: true },
    });

    if (!user || !user.active) {
      throw new NotFoundException('Assigned user not found');
    }
  }
}
