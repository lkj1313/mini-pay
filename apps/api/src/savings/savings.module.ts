import { Module } from '@nestjs/common';
import { SavingsAutoTransferService } from './savings-auto-transfer.service';
import { SavingsBatchService } from './savings-batch.service';
import { SavingsInterestService } from './savings-interest.service';
import { SavingsSchedulerService } from './savings-scheduler.service';

@Module({
  providers: [
    SavingsInterestService,
    SavingsAutoTransferService,
    SavingsBatchService,
    SavingsSchedulerService,
  ],
  exports: [
    SavingsInterestService,
    SavingsAutoTransferService,
    SavingsBatchService,
    SavingsSchedulerService,
  ],
})
export class SavingsModule {}
