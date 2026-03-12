import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { AuditAction } from '../common/decorators/audit.decorator';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Products')
@Controller('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles('ADMIN', 'INVENTORY_USER')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('PRODUCT_CREATE')
  @ApiOperation({ summary: 'Create a new product' })
  create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.productsService.create(createProductDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'all'],
    example: 'active',
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status: 'active' | 'inactive' | 'all' = 'active',
  ) {
    return this.productsService.findAll(page, limit, search, categoryId, status);
  }

  @Get('low-stock')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Get products with low stock' })
  getLowStock() {
    return this.productsService.getLowStockProducts();
  }

  @Get('search')
  @Roles('ADMIN', 'CASHIER', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Search products by name, SKU or barcode' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  search(@Query('q') query: string, @Query('limit') limit: number = 20) {
    return this.productsService.searchProducts(query, limit);
  }

  @Get('quick-search')
  @Roles('ADMIN', 'CASHIER', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Quick search product by barcode or SKU' })
  @ApiQuery({ name: 'code', required: true })
  quickSearch(@Query('code') code: string) {
    return this.productsService.quickSearch(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'INVENTORY_USER')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('PRODUCT_UPDATE')
  @ApiOperation({ summary: 'Update a product' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.productsService.update(id, updateProductDto, req.user.sub);
  }

  @Put(':id/deactivate')
  @Roles('ADMIN', 'INVENTORY_USER')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('PRODUCT_DEACTIVATE')
  @ApiOperation({ summary: 'Deactivate a product' })
  deactivate(@Param('id') id: string) {
    return this.productsService.deactivate(id);
  }

  @Put(':id/reactivate')
  @Roles('ADMIN', 'INVENTORY_USER')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('PRODUCT_REACTIVATE')
  @ApiOperation({ summary: 'Reactivate a product' })
  reactivate(@Param('id') id: string) {
    return this.productsService.reactivate(id);
  }

  @Delete(':id')
  @Roles('ADMIN', 'INVENTORY_USER')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('PRODUCT_DELETE')
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post('upload')
  @Roles('ADMIN', 'INVENTORY_USER')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload product image' })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.productsService.uploadImage(file);
  }

  @Post(':id/upload')
  @Roles('ADMIN', 'INVENTORY_USER')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload image for specific product' })
  async uploadProductImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.productsService.uploadProductImage(id, file);
  }
}
