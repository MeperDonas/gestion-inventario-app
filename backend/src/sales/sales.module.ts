import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SettingsModule } from '../settings/settings.module';
import { SequenceModule } from '../common/sequences/sequence.module';

@Module({
  imports: [SettingsModule, SequenceModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
