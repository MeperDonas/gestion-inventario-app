import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';

type AuditContext = {
  resource?: string;
  resourceId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
};

const userAdminSelect = {
  id: true,
  email: true,
  name: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;

function attachAuditContext<T extends object>(
  value: T,
  context: AuditContext,
): T {
  Object.defineProperty(value, '__auditContext', {
    value: context,
    enumerable: false,
    configurable: true,
  });

  return value;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    await this.ensureEmailAvailable(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: userAdminSelect,
    });

    return attachAuditContext(createdUser, {
      resource: 'User',
      resourceId: createdUser.id,
      summary: `Created user ${createdUser.name} (${createdUser.email})`,
      metadata: {
        targetUserEmail: createdUser.email,
        targetUserName: createdUser.name,
        active: createdUser.active,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: userAdminSelect,
    });
  }

  async update(
    _adminUserId: string,
    userId: string,
    updateUserDto: UpdateUserDto,
  ) {
    const previousUser = await this.findUserOrThrow(userId);

    if (updateUserDto.email) {
      await this.ensureEmailAvailable(updateUserDto.email, userId);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateUserDto.name !== undefined
          ? { name: updateUserDto.name }
          : {}),
        ...(updateUserDto.email !== undefined
          ? { email: updateUserDto.email }
          : {}),
      },
      select: userAdminSelect,
    });

    const changedFields: string[] = [];
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    if (
      updateUserDto.name !== undefined &&
      previousUser.name !== updatedUser.name
    ) {
      changedFields.push('name');
      changes.name = { from: previousUser.name, to: updatedUser.name };
    }

    if (
      updateUserDto.email !== undefined &&
      previousUser.email !== updatedUser.email
    ) {
      changedFields.push('email');
      changes.email = { from: previousUser.email, to: updatedUser.email };
    }

    const summary =
      changedFields.length > 0
        ? `Updated user ${updatedUser.name} (${updatedUser.email}): ${changedFields.join(', ')}`
        : `Update requested for user ${updatedUser.name} (${updatedUser.email}) without effective field changes`;

    return attachAuditContext(updatedUser, {
      resource: 'User',
      resourceId: updatedUser.id,
      summary,
      metadata: {
        targetUserEmail: updatedUser.email,
        targetUserName: updatedUser.name,
        changedFields,
        changes,
      },
    });
  }

  async toggleActive(adminUserId: string, userId: string) {
    if (adminUserId === userId) {
      throw new BadRequestException(
        'Admins cannot deactivate their own account',
      );
    }

    const user = await this.findUserOrThrow(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { active: !user.active },
      select: userAdminSelect,
    });

    return attachAuditContext(updatedUser, {
      resource: 'User',
      resourceId: updatedUser.id,
      summary: `${updatedUser.active ? 'Reactivated' : 'Deactivated'} user ${updatedUser.name} (${updatedUser.email})`,
      metadata: {
        targetUserEmail: updatedUser.email,
        targetUserName: updatedUser.name,
        previousActive: user.active,
        nextActive: updatedUser.active,
      },
    });
  }

  async resetPassword(
    adminUserId: string,
    userId: string,
    dto: ResetUserPasswordDto,
    organizationId: string,
  ) {
    const targetUser = await this.findUserOrThrow(userId);
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        organizationId,
        action: 'ADMIN_PASSWORD_RESET',
        resource: 'User',
        resourceId: userId,
        metadata: {
          summary: `Reset password for user ${targetUser.name} (${targetUser.email})`,
          targetUserId: userId,
          targetUserEmail: targetUser.email,
          targetUserName: targetUser.name,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return { message: 'Contraseña restablecida exitosamente' };
  }

  async remove(adminUserId: string, userId: string) {
    if (adminUserId === userId) {
      throw new BadRequestException('Admins cannot delete their own account');
    }

    const user = await this.findUserOrThrow(userId);

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return attachAuditContext(
      { message: 'User deleted successfully' },
      {
        resource: 'User',
        resourceId: userId,
        summary: `Deleted user ${user.name} (${user.email})`,
        metadata: {
          targetUserEmail: user.email,
          targetUserName: user.name,
          active: user.active,
        },
      },
    );
  }

  private async ensureEmailAvailable(email: string, excludeUserId?: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email,
        ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }
  }

  private async findUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
