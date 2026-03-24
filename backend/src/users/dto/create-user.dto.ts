import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({
    enum: ['ADMIN', 'CASHIER', 'INVENTORY_USER'],
    example: 'CASHIER',
  })
  @IsEnum(['ADMIN', 'CASHIER', 'INVENTORY_USER'])
  role: 'ADMIN' | 'CASHIER' | 'INVENTORY_USER';
}
