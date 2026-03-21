import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: {
    getMyTransactions: jest.Mock;
  };

  beforeEach(async () => {
    transactionService = {
      getMyTransactions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: transactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('returns the authenticated user transactions', async () => {
    transactionService.getMyTransactions.mockResolvedValue([
      {
        id: 'tx-1',
        type: 'SELF_DEPOSIT',
      },
    ]);

    await expect(
      controller.getMyTransactions({
        user: {
          id: 'user-1',
        },
      } as any),
    ).resolves.toEqual([
      {
        id: 'tx-1',
        type: 'SELF_DEPOSIT',
      },
    ]);
  });
});
