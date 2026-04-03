import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

const taskStatuses = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: taskStatuses, example: 'IN_PROGRESS' })
  @IsEnum(taskStatuses)
  status: (typeof taskStatuses)[number];

  @ApiPropertyOptional({ example: 'Movida desde el dashboard principal' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  note?: string;
}
