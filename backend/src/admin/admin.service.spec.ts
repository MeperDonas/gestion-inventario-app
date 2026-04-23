import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { OrgRole, OrgStatus, PlanType } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;

  const prismaMock = {
    organization: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    organizationUser: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    organizationSequence: {
      createMany: jest.fn(),
    },
    refreshToken: {
      updateMany: jest.fn(),
    },
  };

  const authServiceMock = {
    revokeOrganizationTokens: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminService(
      prismaMock as never,
      authServiceMock as never,
    );
  });

  describe('createOrganization', () => {
    it('creates organization with a new admin user', async () => {
      prismaMock.organization.findFirst.mockResolvedValue(null);
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'admin@example.com',
        name: 'Admin User',
      });
      prismaMock.organization.create.mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        plan: PlanType.BASIC,
        status: OrgStatus.TRIAL,
      });
      prismaMock.organizationSequence.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createOrganization({
        name: 'Test Org',
        slug: 'test-org',
        plan: PlanType.BASIC,
        admin: {
          email: 'admin@example.com',
          name: 'Admin User',
        },
      });

      expect(prismaMock.organization.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test Org',
            slug: 'test-org',
          }),
        }),
      );
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(prismaMock.organizationUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            organizationId: 'org-1',
            role: OrgRole.ADMIN,
            isPrimaryOwner: true,
          }),
        }),
      );
      expect(result.organization.slug).toBe('test-org');
      expect(result.tempPassword).toBeDefined();
    });

    it('reuses existing user by email as admin', async () => {
      prismaMock.organization.findFirst.mockResolvedValue(null);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'admin@example.com',
        name: 'Admin User',
      });
      prismaMock.organization.create.mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        plan: PlanType.BASIC,
        status: OrgStatus.TRIAL,
      });
      prismaMock.organizationSequence.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createOrganization({
        name: 'Test Org',
        slug: 'test-org',
        admin: {
          email: 'admin@example.com',
          name: 'Admin User',
        },
      });

      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(result.tempPassword).toBeUndefined();
      expect(result.message).toContain('Existing user assigned');
    });

    it('fails if slug already exists', async () => {
      prismaMock.organization.findFirst.mockResolvedValue({
        id: 'org-1',
        slug: 'test-org',
      });

      await expect(
        service.createOrganization({
          name: 'Test Org',
          slug: 'test-org',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findAllOrganizations', () => {
    it('returns organizations with userCount', async () => {
      prismaMock.organization.findMany.mockResolvedValue([
        {
          id: 'org-1',
          name: 'Org One',
          slug: 'org-one',
          _count: { users: 5 },
        },
        {
          id: 'org-2',
          name: 'Org Two',
          slug: 'org-two',
          _count: { users: 3 },
        },
      ]);

      const result = await service.findAllOrganizations();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'org-1',
          userCount: 5,
        }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          id: 'org-2',
          userCount: 3,
        }),
      );
    });
  });

  describe('findOrganizationById', () => {
    it('returns organization with users and sequences', async () => {
      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        name: 'Org One',
        slug: 'org-one',
        users: [
          {
            id: 'ou-1',
            user: { id: 'user-1', email: 'a@example.com', name: 'A', active: true },
          },
        ],
        sequences: [{ id: 'seq-1', type: 'SALE', currentNumber: 0 }],
      });

      const result = await service.findOrganizationById('org-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'org-1',
          users: expect.any(Array),
          sequences: expect.any(Array),
        }),
      );
    });

    it('throws NotFoundException if organization does not exist', async () => {
      prismaMock.organization.findUnique.mockResolvedValue(null);

      await expect(service.findOrganizationById('non-existent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('updates organization status', async () => {
      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        status: OrgStatus.TRIAL,
      });
      prismaMock.organization.update.mockResolvedValue({
        id: 'org-1',
        status: OrgStatus.ACTIVE,
      });

      const result = await service.updateStatus('org-1', { status: OrgStatus.ACTIVE });

      expect(result.status).toBe(OrgStatus.ACTIVE);
      expect(authServiceMock.revokeOrganizationTokens).not.toHaveBeenCalled();
    });

    it('revokes tokens if status is SUSPENDED', async () => {
      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        status: OrgStatus.ACTIVE,
      });
      prismaMock.organization.update.mockResolvedValue({
        id: 'org-1',
        status: OrgStatus.SUSPENDED,
      });

      const result = await service.updateStatus('org-1', { status: OrgStatus.SUSPENDED });

      expect(result.status).toBe(OrgStatus.SUSPENDED);
      expect(authServiceMock.revokeOrganizationTokens).toHaveBeenCalledWith('org-1');
    });
  });

  describe('updatePlan', () => {
    it('updates organization plan', async () => {
      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        plan: PlanType.BASIC,
      });
      prismaMock.organization.update.mockResolvedValue({
        id: 'org-1',
        plan: PlanType.PRO,
      });

      const result = await service.updatePlan('org-1', { plan: PlanType.PRO });

      expect(result.plan).toBe(PlanType.PRO);
    });

    it('throws NotFoundException if organization does not exist', async () => {
      prismaMock.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePlan('non-existent', { plan: PlanType.PRO }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getMetrics', () => {
    it('returns correct metrics', async () => {
      prismaMock.organization.count.mockResolvedValueOnce(10);
      prismaMock.organization.count.mockResolvedValueOnce(7);
      prismaMock.organization.count.mockResolvedValueOnce(2);
      prismaMock.organization.count.mockResolvedValueOnce(1);
      prismaMock.user.count.mockResolvedValue(25);
      prismaMock.organization.groupBy.mockResolvedValue([
        { plan: PlanType.BASIC, _count: { id: 8 } },
        { plan: PlanType.PRO, _count: { id: 2 } },
      ]);

      const result = await service.getMetrics();

      expect(result).toEqual({
        totalOrganizations: 10,
        activeOrganizations: 7,
        trialOrganizations: 2,
        suspendedOrganizations: 1,
        totalUsers: 25,
        organizationsByPlan: {
          [PlanType.BASIC]: 8,
          [PlanType.PRO]: 2,
        },
      });
    });
  });
});
