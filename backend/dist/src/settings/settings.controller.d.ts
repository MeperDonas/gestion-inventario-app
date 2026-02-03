import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<import("./dto/settings.dto").SettingsResponseDto>;
    getDefaultSettings(): Partial<import("./dto/settings.dto").SettingsResponseDto>;
    updateSettings(updateSettingsDto: UpdateSettingsDto, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./dto/settings.dto").SettingsResponseDto>;
    uploadLogo(file: Express.Multer.File, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        logoUrl: string;
    }>;
}
