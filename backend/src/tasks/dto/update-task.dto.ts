import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Revisar stock de vitrina' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    example: 'Validar productos con menos de 5 unidades.',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({
    example: '2b7f0d74-ef90-4c55-9d0c-17d44a8df0e2',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  assignedToId?: string | null;

  @ApiPropertyOptional({ example: '2026-03-30T15:00:00.000Z', nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  dueDate?: string | null;
}
