import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Revisar stock de vitrina' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional({ example: 'Validar productos con menos de 5 unidades.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '2b7f0d74-ef90-4c55-9d0c-17d44a8df0e2' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ example: '2026-03-30T15:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
