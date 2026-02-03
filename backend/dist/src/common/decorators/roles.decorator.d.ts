export declare const ROLES_KEY = "roles";
export type RoleType = 'ADMIN' | 'CASHIER' | 'INVENTORY_USER';
export declare const Roles: (...roles: RoleType[]) => import("@nestjs/common").CustomDecorator<string>;
