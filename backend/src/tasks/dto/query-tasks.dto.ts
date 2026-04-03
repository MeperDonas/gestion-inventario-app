import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryTasksDto {
  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ example: 'stock' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeCompleted?: boolean;
}
