import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsObject, Min } from 'class-validator';

export class RetryImportRowDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(2)
  rowIndex: number;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: {
      name: 'Coca Cola 400ml',
      sku: 'BEB-001',
      salePrice: 4800,
      stock: 25,
      category: 'Bebidas',
    },
  })
  @IsObject()
  correctedData: Record<string, unknown>;
}
