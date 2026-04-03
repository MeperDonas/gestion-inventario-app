import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  const usersServiceMock = {
    update: jest.fn(),
    resetPassword: jest.fn(),
  };

  const createContext = (
    handler: (...args: unknown[]) => unknown,
    role: string,
  ): ExecutionContext =>
    ({
      getHandler: () => handler,
      getClass: () => UsersController,
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    }) as unknown as ExecutionContext;

  it('marks the controller as ADMIN-only', () => {
    const requiredRoles = Reflect.getMetadata(ROLES_KEY, UsersController);

    expect(requiredRoles).toEqual(['ADMIN']);
  });

  it('denies non-admin access at the users boundary', () => {
    const controller = new UsersController(usersServiceMock as never);
    const guard = new RolesGuard(new Reflector());

    expect(() =>
      guard.canActivate(createContext(controller.findAll, 'CASHIER')),
    ).toThrow(ForbiddenException);
  });

  it('delegates update with the acting admin id', async () => {
    const controller = new UsersController(usersServiceMock as never);
    const dto = { name: 'Ana Admin', role: 'CASHIER' as const };
    const req = { user: { sub: 'admin-1' } };
    const expected = {
      id: 'user-2',
      ...dto,
      email: 'ana@example.com',
      active: true,
    };

    usersServiceMock.update.mockResolvedValue(expected);

    await expect(controller.update('user-2', dto, req)).resolves.toEqual(
      expected,
    );
    expect(usersServiceMock.update).toHaveBeenCalledWith(
      'admin-1',
      'user-2',
      dto,
    );
  });

  it('delegates password resets to the users service', async () => {
    const controller = new UsersController(usersServiceMock as never);
    const dto = { newPassword: 'NuevaClaveSegura123' };
    const req = { user: { sub: 'admin-1' } };
    const expected = { message: 'Contraseña restablecida exitosamente' };

    usersServiceMock.resetPassword.mockResolvedValue(expected);

    await expect(controller.resetPassword('user-2', dto, req)).resolves.toEqual(
      expected,
    );
    expect(usersServiceMock.resetPassword).toHaveBeenCalledWith(
      'admin-1',
      'user-2',
      dto,
    );
  });
});
