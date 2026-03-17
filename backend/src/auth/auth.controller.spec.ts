import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

describe('AuthController admin reset authorization', () => {
  const authServiceMock = {
    adminResetPassword: jest.fn(),
  };

  const createContext = (
    handler: (...args: unknown[]) => unknown,
    role: string,
  ): ExecutionContext =>
    ({
      getHandler: () => handler,
      getClass: () => AuthController,
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    }) as unknown as ExecutionContext;

  it('marks adminResetPassword as ADMIN-only', () => {
    const controller = new AuthController(authServiceMock as never);

    const requiredRoles = Reflect.getMetadata(
      ROLES_KEY,
      controller.adminResetPassword,
    );

    expect(requiredRoles).toEqual(['ADMIN']);
  });

  it('denies non-admin role on adminResetPassword route', () => {
    const controller = new AuthController(authServiceMock as never);
    const guard = new RolesGuard(new Reflector());

    expect(() =>
      guard.canActivate(
        createContext(controller.adminResetPassword, 'CASHIER'),
      ),
    ).toThrow(ForbiddenException);
  });

  it('[#05a] allows ADMIN reset path and delegates to service', async () => {
    const controller = new AuthController(authServiceMock as never);
    const dto = {
      userId: 'target-user-1',
      newPassword: 'NuevaClaveSegura123',
    };
    const req = { user: { sub: 'admin-1' } };
    const expected = { message: 'Contraseña restablecida exitosamente' };

    authServiceMock.adminResetPassword.mockResolvedValue(expected);

    await expect(controller.adminResetPassword(dto, req)).resolves.toEqual(
      expected,
    );
    expect(authServiceMock.adminResetPassword).toHaveBeenCalledWith(
      'admin-1',
      dto,
    );
  });
});
