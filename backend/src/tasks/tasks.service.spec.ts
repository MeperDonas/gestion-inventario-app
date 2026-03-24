import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TaskEventType, TaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
    taskEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => unknown) =>
      callback(prismaMock),
    );
    service = new TasksService(prismaMock as never);
  });

  it('creates a task and appends the initial immutable event', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'user-1' });
    prismaMock.task.create.mockResolvedValue({
      id: 'task-1',
      title: 'Revisar stock',
      status: TaskStatus.PENDING,
      createdById: 'user-1',
    });
    prismaMock.taskEvent.create.mockResolvedValue({ id: 'event-1' });

    const result = await service.create(
      { id: 'user-1', role: 'CASHIER' },
      { title: 'Revisar stock' },
    );

    expect(prismaMock.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Revisar stock',
          createdBy: { connect: { id: 'user-1' } },
        }),
      }),
    );
    expect(prismaMock.taskEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taskId: 'task-1',
        type: TaskEventType.CREATED,
        toStatus: TaskStatus.PENDING,
        createdById: 'user-1',
      }),
    });
    expect(result).toEqual(expect.objectContaining({ id: 'task-1' }));
  });

  it('rejects invalid status transitions without appending events', async () => {
    prismaMock.task.findFirst.mockResolvedValue({
      id: 'task-2',
      title: 'Cerrar caja',
      status: TaskStatus.PENDING,
      createdById: 'user-2',
      assignedToId: null,
      deletedAt: null,
    });

    await expect(
      service.updateStatus('task-2', { id: 'user-2', role: 'CASHIER' }, { status: 'PENDING' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.task.update).not.toHaveBeenCalled();
    expect(prismaMock.taskEvent.create).not.toHaveBeenCalled();
  });

  it('appends status history without mutating prior timeline events', async () => {
    prismaMock.task.findFirst.mockResolvedValue({
      id: 'task-immut-1',
      title: 'Etiquetar productos',
      status: TaskStatus.PENDING,
      createdById: 'admin-1',
      assignedToId: 'cashier-9',
      deletedAt: null,
    });
    prismaMock.task.update.mockResolvedValue({
      id: 'task-immut-1',
      status: TaskStatus.IN_PROGRESS,
    });
    prismaMock.taskEvent.create.mockResolvedValue({ id: 'event-immut-2' });

    await expect(
      service.updateStatus(
        'task-immut-1',
        { id: 'cashier-9', role: 'CASHIER' },
        { status: TaskStatus.IN_PROGRESS, note: 'Tomada para ejecucion' },
      ),
    ).resolves.toEqual({
      id: 'task-immut-1',
      status: TaskStatus.IN_PROGRESS,
    });

    expect(prismaMock.taskEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taskId: 'task-immut-1',
        type: TaskEventType.STATUS_CHANGED,
        fromStatus: TaskStatus.PENDING,
        toStatus: TaskStatus.IN_PROGRESS,
        createdById: 'cashier-9',
      }),
    });
    expect(prismaMock.taskEvent.update).not.toHaveBeenCalled();
    expect(prismaMock.taskEvent.delete).not.toHaveBeenCalled();
  });

  it('scopes non-admin list queries to created or assigned tasks', async () => {
    prismaMock.task.findMany.mockResolvedValue([]);

    await service.findAll(
      { id: 'cashier-1', role: 'CASHIER' },
      { includeCompleted: false },
    );

    expect(prismaMock.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: [{ createdById: 'cashier-1' }, { assignedToId: 'cashier-1' }],
            }),
          ]),
        }),
      }),
    );
  });

  it('soft deletes tasks and appends a deletion event', async () => {
    prismaMock.task.findFirst.mockResolvedValue({
      id: 'task-3',
      title: 'Arqueo final',
      status: TaskStatus.COMPLETED,
      createdById: 'admin-1',
      assignedToId: null,
      deletedAt: null,
    });
    prismaMock.task.update.mockResolvedValue({ id: 'task-3' });
    prismaMock.taskEvent.create.mockResolvedValue({ id: 'event-3' });

    await expect(
      service.remove('task-3', { id: 'admin-1', role: 'ADMIN' }),
    ).resolves.toEqual({ message: 'Task deleted successfully' });

    expect(prismaMock.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'task-3' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    );
    expect(prismaMock.taskEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taskId: 'task-3',
        type: TaskEventType.DELETED,
        createdById: 'admin-1',
      }),
    });
  });

  it('rejects assignment to inactive users', async () => {
    prismaMock.task.findFirst.mockResolvedValue({
      id: 'task-5',
      title: 'Contar billetes',
      status: TaskStatus.PENDING,
      createdById: 'admin-1',
      assignedToId: null,
      deletedAt: null,
    });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-x', active: false });

    await expect(
      service.update('task-5', { id: 'admin-1', role: 'ADMIN' }, { assignedToId: 'user-x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
