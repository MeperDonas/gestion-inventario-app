export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
}
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    role: 'ADMIN' | 'CASHIER' | 'INVENTORY_USER';
}
export declare class UpdateProfileDto {
    name?: string;
    email?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
