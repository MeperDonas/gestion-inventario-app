import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export interface OrganizationSettings {
  companyName?: string;
  currency?: string;
  taxRate?: number;
  receiptPrefix?: string;
  printHeader?: string;
  printFooter?: string;
  logoUrl?: string;
  [key: string]: unknown;
}

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async find(organizationId: string): Promise<OrganizationSettings> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });
    return (org?.settings as OrganizationSettings) ?? {};
  }

  async update(
    organizationId: string,
    dto: UpdateSettingsDto,
  ): Promise<unknown> {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: { settings: dto as any },
    });
  }

  getDefaultSettings(): Partial<OrganizationSettings> {
    return {
      companyName: 'Mi Negocio',
      currency: 'COP',
      taxRate: 19,
      receiptPrefix: 'REC-',
    };
  }

  async uploadLogo(
    organizationId: string,
    file: Express.Multer.File,
  ): Promise<{ logoUrl: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const logoUrl = await this.cloudinaryService.uploadImage(file, 'logos');

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        settings: {
          ...(await this.find(organizationId)),
          logoUrl,
        } as any,
      },
    });

    return { logoUrl };
  }
}
