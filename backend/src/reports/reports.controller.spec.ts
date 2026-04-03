import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReportsController } from './reports.controller';

type DashboardResponse = {
  appliedRange: { timezone: string };
  comparisonRange: unknown;
};

describe('ReportsController', () => {
  const reportsServiceMock = {
    getDashboardKPIs: jest.fn(),
    getUserPerformance: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createContext = (
    handler: (...args: unknown[]) => unknown,
    role: string,
  ): ExecutionContext =>
    ({
      getHandler: () => handler,
      getClass: () => ReportsController,
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    }) as unknown as ExecutionContext;

  it('restricts reports analytics to admins only', () => {
    const requiredRoles = Reflect.getMetadata(ROLES_KEY, ReportsController);

    expect(requiredRoles).toEqual(['ADMIN']);
  });

  it('denies analytics access to unauthorized business roles', () => {
    const controller = new ReportsController(reportsServiceMock as never);
    const guard = new RolesGuard(new Reflector());

    expect(() =>
      guard.canActivate(
        createContext(controller.getUserPerformance, 'CASHIER'),
      ),
    ).toThrow(ForbiddenException);
  });

  it('forwards date filters to service and returns metadata-bearing response', async () => {
    const controller = new ReportsController(reportsServiceMock as never);
    reportsServiceMock.getDashboardKPIs.mockResolvedValue({
      totalSales: 0,
      appliedRange: {
        startDate: '2026-03-01',
        endDate: '2026-03-31',
        timezone: 'America/Bogota',
      },
      comparisonRange: {
        startDate: '2026-01-30',
        endDate: '2026-02-28',
        timezone: 'America/Bogota',
      },
    });

    const result = (await controller.getDashboard(
      '2026-03-01',
      '2026-03-31',
    )) as DashboardResponse;

    expect(reportsServiceMock.getDashboardKPIs).toHaveBeenCalledWith(
      '2026-03-01',
      '2026-03-31',
    );
    expect(result.appliedRange.timezone).toBe('America/Bogota');
    expect(result.comparisonRange).toBeDefined();
  });

  it('parses compare and userIds before delegating user performance analytics', async () => {
    const controller = new ReportsController(reportsServiceMock as never);
    reportsServiceMock.getUserPerformance.mockResolvedValue({
      data: [],
      appliedRange: {
        startDate: '2026-03-01',
        endDate: '2026-03-31',
        timezone: 'America/Bogota',
      },
    });

    await controller.getUserPerformance(
      '2026-03-01',
      '2026-03-31',
      'false',
      ' user-1, user-2 ,,user-1 ',
    );

    expect(reportsServiceMock.getUserPerformance).toHaveBeenCalledWith(
      '2026-03-01',
      '2026-03-31',
      false,
      ['user-1', 'user-2'],
    );
  });
});
