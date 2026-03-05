import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
