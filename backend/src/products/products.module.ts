import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsSearchController } from './products-search.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [ProductsController, ProductsSearchController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
