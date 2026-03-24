import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { TasksController } from './tasks.controller';

describe('TasksController', () => {
  const tasksServiceMock = {
    create: jest.fn(),
    updateStatus: jest.fn(),
    getTimeline: jest.fn(),
  };

  const createContext = (
    handler: (...args: unknown[]) => unknown,
    role: string,
  ): ExecutionContext =>
    ({
      getHandler: () => handler,
      getClass: () => TasksController,
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    }) as unknown as ExecutionContext;

  it('allows every authenticated business role at the tasks boundary', () => {
    const requiredRoles = Reflect.getMetadata(ROLES_KEY, TasksController);

    expect(requiredRoles).toEqual(['ADMIN', 'CASHIER', 'INVENTORY_USER']);
  });

  it('denies access to roles outside the configured task boundary', () => {
    const controller = new TasksController(tasksServiceMock as never);
    const guard = new RolesGuard(new Reflector());

    expect(() =>
      guard.canActivate(createContext(controller.findAll, 'UNKNOWN')),
    ).toThrow(ForbiddenException);
  });

  it('delegates task creation with the authenticated actor', async () => {
    const controller = new TasksController(tasksServiceMock as never);
    const dto = { title: 'Revisar caja' };
    const req = { user: { sub: 'user-1', role: 'CASHIER' as const } };
    const expected = { id: 'task-1', ...dto };

    tasksServiceMock.create.mockResolvedValue(expected);

    await expect(controller.create(dto, req)).resolves.toEqual(expected);
    expect(tasksServiceMock.create).toHaveBeenCalledWith(
      { id: 'user-1', role: 'CASHIER' },
      dto,
    );
  });

  it('delegates status transitions and timeline access', async () => {
    const controller = new TasksController(tasksServiceMock as never);
    const req = { user: { sub: 'admin-1', role: 'ADMIN' as const } };
    const statusDto = { status: 'IN_PROGRESS' as const, note: 'Tomada por admin' };
    const updatedTask = { id: 'task-9', status: 'IN_PROGRESS' };
    const timeline = [{ id: 'event-1', taskId: 'task-9' }];

    tasksServiceMock.updateStatus.mockResolvedValue(updatedTask);
    tasksServiceMock.getTimeline.mockResolvedValue(timeline);

    await expect(controller.updateStatus('task-9', statusDto, req)).resolves.toEqual(
      updatedTask,
    );
    await expect(controller.getTimeline('task-9', req)).resolves.toEqual(timeline);

    expect(tasksServiceMock.updateStatus).toHaveBeenCalledWith(
      'task-9',
      { id: 'admin-1', role: 'ADMIN' },
      statusDto,
    );
    expect(tasksServiceMock.getTimeline).toHaveBeenCalledWith('task-9', {
      id: 'admin-1',
      role: 'ADMIN',
    });
  });
});
