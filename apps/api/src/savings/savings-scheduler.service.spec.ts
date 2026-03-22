import { Test, TestingModule } from '@nestjs/testing';
import { SavingsBatchService } from './savings-batch.service';
import { SavingsSchedulerService } from './savings-scheduler.service';

describe('SavingsSchedulerService', () => {
  let service: SavingsSchedulerService;
  let savingsBatchService: {
    runDailyInterestBatch: jest.Mock;
    runDailyFixedAutoTransferBatch: jest.Mock;
  };

  beforeEach(async () => {
    savingsBatchService = {
      runDailyInterestBatch: jest.fn(),
      runDailyFixedAutoTransferBatch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsSchedulerService,
        {
          provide: SavingsBatchService,
          useValue: savingsBatchService,
        },
      ],
    }).compile();

    service = module.get<SavingsSchedulerService>(SavingsSchedulerService);
  });

  it('매일 적금 이자 지급 배치를 호출한다', async () => {
    savingsBatchService.runDailyInterestBatch.mockResolvedValue({
      processedAt: new Date('2026-03-22T04:00:00.000+09:00'),
      processedCount: 3,
    });

    await expect(service.handleDailyInterest()).resolves.toBeUndefined();

    expect(savingsBatchService.runDailyInterestBatch).toHaveBeenCalledTimes(1);
  });

  it('적금 이자 지급 배치가 실패해도 예외를 밖으로 던지지 않는다', async () => {
    savingsBatchService.runDailyInterestBatch.mockRejectedValue(
      new Error('interest batch failed'),
    );

    await expect(service.handleDailyInterest()).resolves.toBeUndefined();
  });

  it('매일 정기 적금 자동 이체 배치를 호출한다', async () => {
    savingsBatchService.runDailyFixedAutoTransferBatch.mockResolvedValue({
      processedAt: new Date('2026-03-22T08:00:00.000+09:00'),
      processedCount: 2,
      failedCount: 1,
    });

    await expect(service.handleDailyFixedAutoTransfer()).resolves.toBeUndefined();

    expect(
      savingsBatchService.runDailyFixedAutoTransferBatch,
    ).toHaveBeenCalledTimes(1);
  });

  it('정기 적금 자동 이체 배치가 실패해도 예외를 밖으로 던지지 않는다', async () => {
    savingsBatchService.runDailyFixedAutoTransferBatch.mockRejectedValue(
      new Error('auto transfer batch failed'),
    );

    await expect(service.handleDailyFixedAutoTransfer()).resolves.toBeUndefined();
  });
});
