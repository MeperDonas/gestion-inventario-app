import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger/dist/decorators';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'Mi Empresa S.A.S.' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 19, minimum: 0, maximum: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ example: 'FACT-' })
  @IsString()
  @IsOptional()
  invoicePrefix?: string;

  @ApiPropertyOptional({ example: 'Empresa ABC - Factura #' })
  @IsString()
  @IsOptional()
  printHeader?: string;

  @ApiPropertyOptional({ example: 'Pague en efectivo. Gracias por su compra.' })
  @IsString()
  @IsOptional()
  printFooter?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class SettingsResponseDto {
  @ApiProperty({ example: 'Mi Negocio' })
  companyName: string;

  @ApiProperty({ example: 'COP' })
  currency: string;

  @ApiProperty({ example: 19 })
  taxRate: number;

  @ApiProperty({ example: 'INV-' })
  invoicePrefix: string;

  @ApiProperty({ example: 'Factura de Venta' })
  printHeader?: string;

  @ApiProperty({ example: 'Gracias por su compra' })
  printFooter?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  logoUrl?: string;
}
