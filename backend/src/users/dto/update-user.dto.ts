import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    enum: ['ADMIN', 'CASHIER', 'INVENTORY_USER'],
    example: 'CASHIER',
    required: false,
  })
  @IsEnum(['ADMIN', 'CASHIER', 'INVENTORY_USER'])
  @IsOptional()
  role?: 'ADMIN' | 'CASHIER' | 'INVENTORY_USER';
}
