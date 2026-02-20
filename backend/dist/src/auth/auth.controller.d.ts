import { AuthService } from './auth.service';
import { LoginDto, UpdateProfileDto, ChangePasswordDto, CreateUserDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    createUser(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUsers(): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    toggleUserActive(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProfile(req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(updateProfileDto: UpdateProfileDto, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(changePasswordDto: ChangePasswordDto, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        message: string;
    }>;
}
