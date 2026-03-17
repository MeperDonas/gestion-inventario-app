import { ReportsController } from './reports.controller';

type DashboardResponse = {
  appliedRange: { timezone: string };
  comparisonRange: unknown;
};

describe('ReportsController', () => {
  const reportsServiceMock = {
    getDashboardKPIs: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
});
