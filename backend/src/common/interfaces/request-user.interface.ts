import { OrgRole } from '@prisma/client';

export interface RequestUser {
  userId: string;
  email: string;
  organizationId: string;
  role: OrgRole;
  tokenVersion: number;
}
