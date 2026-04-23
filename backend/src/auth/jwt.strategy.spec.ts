import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OrgRole } from '@prisma/client';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    organizationUser: {
      findFirst: jest.fn(),
    },
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const payload = {
      sub: 'user-1',
      email: 'test@example.com',
      tokenVersion: 1,
      organizationId: 'org-1',
      role: OrgRole.ADMIN,
    };

    it('should throw UnauthorizedException when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive'),
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        active: false,
        tokenVersion: 1,
      });

      await expect(strategy.validate(payload)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive'),
      );
    });

    it('should throw UnauthorizedException when tokenVersion does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        active: true,
        tokenVersion: 2,
      });

      await expect(strategy.validate(payload)).rejects.toThrow(
        new UnauthorizedException('Token revoked'),
      );
    });

    it('should throw UnauthorizedException when organization membership not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        active: true,
        tokenVersion: 1,
      });
      mockPrisma.organizationUser.findFirst.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        new UnauthorizedException('Organization membership not found'),
      );
    });

    it('should return RequestUser when all validations pass', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        active: true,
        tokenVersion: 1,
      });
      mockPrisma.organizationUser.findFirst.mockResolvedValue({
        id: 'ou-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: OrgRole.ADMIN,
      });

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-1',
        email: 'test@example.com',
        organizationId: 'org-1',
        role: OrgRole.ADMIN,
        tokenVersion: 1,
      });

      expect(mockPrisma.organizationUser.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          organizationId: 'org-1',
        },
      });
    });

    it('should use role from OrganizationUser when it differs from payload', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        active: true,
        tokenVersion: 1,
      });
      mockPrisma.organizationUser.findFirst.mockResolvedValue({
        id: 'ou-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: OrgRole.MEMBER,
      });

      const result = await strategy.validate(payload);

      expect(result.role).toBe(OrgRole.MEMBER);
    });
  });
});
