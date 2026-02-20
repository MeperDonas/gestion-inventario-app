"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let SettingsService = class SettingsService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async getSettings() {
        const settings = await this.ensureSettings();
        return {
            companyName: settings.companyName,
            currency: settings.currency,
            taxRate: Number(settings.taxRate),
            invoicePrefix: settings.invoicePrefix,
            printHeader: settings.printHeader || undefined,
            printFooter: settings.printFooter || undefined,
            logoUrl: settings.logoUrl || undefined,
        };
    }
    async updateSettings(userId, updateSettingsDto) {
        const settings = await this.ensureSettings();
        const updated = await this.prisma.settings.update({
            where: { id: settings.id },
            data: {
                ...updateSettingsDto,
                userId,
            },
        });
        return {
            companyName: updated.companyName,
            currency: updated.currency,
            taxRate: Number(updated.taxRate),
            invoicePrefix: updated.invoicePrefix,
            printHeader: updated.printHeader || undefined,
            printFooter: updated.printFooter || undefined,
            logoUrl: updated.logoUrl || undefined,
        };
    }
    getDefaultSettings() {
        return {
            companyName: 'Mi Negocio',
            currency: 'COP',
            taxRate: 19,
            invoicePrefix: 'INV-',
        };
    }
    async uploadLogo(userId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const settings = await this.ensureSettings();
        const logoUrl = await this.cloudinaryService.uploadImage(file, 'logos');
        await this.prisma.settings.update({
            where: { id: settings.id },
            data: { logoUrl, userId },
        });
        return { logoUrl };
    }
    async ensureSettings() {
        const existing = await this.prisma.settings.findFirst({
            orderBy: { createdAt: 'asc' },
        });
        if (existing) {
            return existing;
        }
        return this.prisma.settings.create({
            data: {
                companyName: 'Mi Negocio',
                currency: 'COP',
                taxRate: 19,
                invoicePrefix: 'INV-',
            },
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map