import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto, SettingsResponseDto } from './dto/settings.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getSettings(): Promise<SettingsResponseDto> {
    const settings = await this.ensureSettings();

    return {
      companyName: settings.companyName,
      currency: settings.currency,
      taxRate: Number(settings.taxRate),
      receiptPrefix: settings.receiptPrefix,
      printHeader: settings.printHeader || undefined,
      printFooter: settings.printFooter || undefined,
      logoUrl: settings.logoUrl || undefined,
    };
  }

  async updateSettings(
    userId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<SettingsResponseDto> {
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
      receiptPrefix: updated.receiptPrefix,
      printHeader: updated.printHeader || undefined,
      printFooter: updated.printFooter || undefined,
      logoUrl: updated.logoUrl || undefined,
    };
  }

  getDefaultSettings(): Partial<SettingsResponseDto> {
    return {
      companyName: 'Mi Negocio',
      currency: 'COP',
      taxRate: 19,
      receiptPrefix: 'REC-',
    };
  }

  async uploadLogo(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ logoUrl: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const settings = await this.ensureSettings();

    const logoUrl = await this.cloudinaryService.uploadImage(file, 'logos');

    await this.prisma.settings.update({
      where: { id: settings.id },
      data: { logoUrl, userId },
    });

    return { logoUrl };
  }

  private async ensureSettings() {
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
        receiptPrefix: 'REC-',
      } as never,
    });
  }
}
