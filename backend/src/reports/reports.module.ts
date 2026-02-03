import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { CacheService } from '../common/services/cache.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, CacheService],
  exports: [ReportsService],
})
export class ReportsModule {}
