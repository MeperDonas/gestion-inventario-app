import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type RoleType = 'ADMIN' | 'CASHIER' | 'INVENTORY_USER';

export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
