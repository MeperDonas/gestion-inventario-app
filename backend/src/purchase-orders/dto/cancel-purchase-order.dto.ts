import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CancelPurchaseOrderDto {
  @ApiProperty({ example: 'Proveedor canceló el pedido' })
  @IsString()
  @MinLength(3)
  reason: string;
}
