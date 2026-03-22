import { Injectable } from '@nestjs/common';
import { SavingsAutoTransferService } from './savings-auto-transfer.service';
import { SavingsInterestService } from './savings-interest.service';

@Injectable()
export class SavingsBatchService {
  constructor(
    private readonly savingsAutoTransferService: SavingsAutoTransferService,
    private readonly savingsInterestService: SavingsInterestService,
  ) {}

  runDailyInterestBatch(now = new Date()) {
    return this.savingsInterestService.applyDailyInterest(now);
  }

  runDailyFixedAutoTransferBatch(now = new Date()) {
    return this.savingsAutoTransferService.applyDailyFixedAutoTransfer(now);
  }
}
