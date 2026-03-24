import { AuthController } from './auth.controller';

describe('AuthController after users boundary centralization', () => {
  const authServiceMock = {
    changePassword: jest.fn(),
  };

  it('does not expose admin lifecycle endpoints anymore', () => {
    const controller = new AuthController(authServiceMock as never);

    expect(controller).not.toHaveProperty('createUser');
    expect(controller).not.toHaveProperty('getUsers');
    expect(controller).not.toHaveProperty('deleteUser');
    expect(controller).not.toHaveProperty('toggleUserActive');
    expect(controller).not.toHaveProperty('adminResetPassword');
  });

  it('keeps change-password delegated to auth service', async () => {
    const controller = new AuthController(authServiceMock as never);
    const dto = {
      currentPassword: 'ClaveActual1',
      newPassword: 'NuevaClaveSegura123',
    };
    const req = { user: { sub: 'admin-1' } };
    const expected = { message: 'Password changed successfully' };

    authServiceMock.changePassword.mockResolvedValue(expected);

    await expect(controller.changePassword(dto, req)).resolves.toEqual(expected);
    expect(authServiceMock.changePassword).toHaveBeenCalledWith(
      'admin-1',
      dto,
    );
  });
});
