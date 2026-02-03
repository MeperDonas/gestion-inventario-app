import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @ApiProperty({ example: 'uuid-product-id' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountAmount?: number;
}

export class PaymentDto {
  @ApiProperty({ enum: ['CASH', 'CARD', 'TRANSFER'], example: 'CASH' })
  @IsEnum(['CASH', 'CARD', 'TRANSFER'])
  method: 'CASH' | 'CARD' | 'TRANSFER';

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;
}

export class CreateSaleDto {
  @ApiProperty({ example: 'uuid-customer-id', required: false })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ type: [SaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountAmount?: number;

  @ApiProperty({ type: [PaymentDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payments?: PaymentDto[];
}

export class UpdateSaleDto {
  @ApiProperty({
    enum: ['COMPLETED', 'CANCELLED', 'RETURNED_PARTIAL'],
    example: 'CANCELLED',
    required: false,
  })
  @IsEnum(['COMPLETED', 'CANCELLED', 'RETURNED_PARTIAL'])
  @IsOptional()
  status?: 'COMPLETED' | 'CANCELLED' | 'RETURNED_PARTIAL';
}
