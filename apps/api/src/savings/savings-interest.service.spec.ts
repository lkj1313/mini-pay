import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SavingsInterestService } from './savings-interest.service';

describe('SavingsInterestService', () => {
  let service: SavingsInterestService;
  let prisma: {
    $transaction: jest.Mock;
    wallet: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    transaction: {
      create: jest.Mock;
    };
    savingsDetail: {
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      wallet: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
      },
      savingsDetail: {
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsInterestService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SavingsInterestService>(SavingsInterestService);

    prisma.$transaction.mockImplementation(async (callback: any) =>
      callback({
        wallet: prisma.wallet,
        transaction: prisma.transaction,
        savingsDetail: prisma.savingsDetail,
      }),
    );
  });

  it('적금 계좌에 하루치 이자를 지급한다', async () => {
    const now = new Date('2026-03-22T04:00:00.000+09:00');

    prisma.wallet.findMany.mockResolvedValue([{ id: 'wallet-savings-1' }]);
    prisma.wallet.findUnique.mockResolvedValue({
      id: 'wallet-savings-1',
      balance: 100000n,
      user: {
        name: '홍길동',
      },
      savingsDetail: {
        walletId: 'wallet-savings-1',
        annualInterestRate: {
          toString: () => '0.03',
        },
        lastInterestAppliedAt: null,
      },
    });

    await expect(service.applyDailyInterest(now)).resolves.toEqual({
      processedAt: now,
      processedCount: 1,
    });

    expect(prisma.wallet.update).toHaveBeenCalledWith({
      where: { id: 'wallet-savings-1' },
      data: {
        balance: {
          increment: 8n,
        },
      },
    });
    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: {
        fromWalletId: null,
        toWalletId: 'wallet-savings-1',
        fromUserNameSnapshot: null,
        toUserNameSnapshot: '홍길동',
        amount: 8n,
        type: 'SAVINGS_INTEREST',
        status: 'SUCCESS',
        description: '적금 이자 지급',
      },
    });
    expect(prisma.savingsDetail.update).toHaveBeenCalledWith({
      where: {
        walletId: 'wallet-savings-1',
      },
      data: {
        lastInterestAppliedAt: now,
      },
    });
  });

  it('오늘 이미 이자를 지급한 적금 계좌는 건너뛴다', async () => {
    const now = new Date('2026-03-22T04:00:00.000+09:00');

    prisma.wallet.findMany.mockResolvedValue([{ id: 'wallet-savings-1' }]);
    prisma.wallet.findUnique.mockResolvedValue({
      id: 'wallet-savings-1',
      balance: 100000n,
      user: {
        name: '홍길동',
      },
      savingsDetail: {
        walletId: 'wallet-savings-1',
        annualInterestRate: {
          toString: () => '0.03',
        },
        lastInterestAppliedAt: new Date('2026-03-22T00:30:00.000+09:00'),
      },
    });

    await expect(service.applyDailyInterest(now)).resolves.toEqual({
      processedAt: now,
      processedCount: 0,
    });

    expect(prisma.wallet.update).not.toHaveBeenCalled();
    expect(prisma.transaction.create).not.toHaveBeenCalled();
    expect(prisma.savingsDetail.update).not.toHaveBeenCalled();
  });
});
