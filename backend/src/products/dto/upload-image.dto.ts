import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  @IsOptional()
  @IsString()
  file: Express.Multer.File;
}
