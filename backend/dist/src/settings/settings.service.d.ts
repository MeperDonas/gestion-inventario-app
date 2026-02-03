import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto, SettingsResponseDto } from './dto/settings.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class SettingsService {
    private prisma;
    private cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    getSettings(): Promise<SettingsResponseDto>;
    updateSettings(userId: string, updateSettingsDto: UpdateSettingsDto): Promise<SettingsResponseDto>;
    getDefaultSettings(): Partial<SettingsResponseDto>;
    uploadLogo(userId: string, file: Express.Multer.File): Promise<{
        logoUrl: string;
    }>;
}
