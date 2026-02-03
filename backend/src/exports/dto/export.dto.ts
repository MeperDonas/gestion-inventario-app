import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger/dist/decorators';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export class ExportQueryDto {
  @ApiProperty({ enum: ['pdf', 'excel', 'csv'], example: 'pdf' })
  @IsEnum(['pdf', 'excel', 'csv'])
  format: ExportFormat;

  @ApiProperty({
    enum: ['sales', 'products', 'customers', 'inventory'],
    example: 'sales',
  })
  @IsEnum(['sales', 'products', 'customers', 'inventory'])
  type: 'sales' | 'products' | 'customers' | 'inventory';

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @Transform(({ value }) => (value && value.trim() !== '' ? value : undefined))
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-31' })
  @IsOptional()
  @Transform(({ value }) => (value && value.trim() !== '' ? value : undefined))
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  limit?: number;
}

export class CsvExportDto {
  @ApiProperty({ example: ',' })
  @IsOptional()
  delimiter?: string;

  @ApiProperty({ example: 'utf-8' })
  @IsOptional()
  encoding?: string;

  @ApiProperty({ example: 'false' })
  @IsOptional()
  includeHeaders?: boolean;

  @ApiProperty({ example: 'true' })
  @IsOptional()
  bom?: boolean;
}
