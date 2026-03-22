import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SavingsBatchService } from './savings-batch.service';

@Injectable()
export class SavingsSchedulerService {
  private readonly logger = new Logger(SavingsSchedulerService.name);

  constructor(private readonly savingsBatchService: SavingsBatchService) {}

  @Cron('0 4 * * *', { timeZone: 'Asia/Seoul' })
  async handleDailyInterest() {
    this.logger.log('적금 이자 지급 배치를 시작합니다.');

    try {
      const result = await this.savingsBatchService.runDailyInterestBatch();

      this.logger.log(
        `적금 이자 지급 배치를 완료했습니다. processedCount=${result.processedCount}`,
      );
    } catch (error) {
      this.logger.error('적금 이자 지급 배치가 실패했습니다.', error);
    }
  }

  @Cron('0 8 * * *', { timeZone: 'Asia/Seoul' })
  async handleDailyFixedAutoTransfer() {
    this.logger.log('정기 적금 자동 이체 배치를 시작합니다.');

    try {
      const result =
        await this.savingsBatchService.runDailyFixedAutoTransferBatch();

      this.logger.log(
        `정기 적금 자동 이체 배치를 완료했습니다. processedCount=${result.processedCount}, failedCount=${result.failedCount}`,
      );
    } catch (error) {
      this.logger.error('정기 적금 자동 이체 배치가 실패했습니다.', error);
    }
  }
}
