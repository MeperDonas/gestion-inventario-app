import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { ProductsModule } from '../products/products.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [ProductsModule, SettingsModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
