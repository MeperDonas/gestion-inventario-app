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

  @ApiPropertyOptional({ example: 'REC-' })
  @IsString()
  @IsOptional()
  receiptPrefix?: string;

  @ApiPropertyOptional({ example: 'Empresa ABC - Comprobante #' })
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

  @ApiProperty({ example: 'REC-' })
  receiptPrefix: string;

  @ApiProperty({ example: 'Comprobante de Pago' })
  printHeader?: string;

  @ApiProperty({ example: 'Gracias por su compra' })
  printFooter?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  logoUrl?: string;
}
