import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SavingsAutoTransferService } from './savings-auto-transfer.service';

describe('SavingsAutoTransferService', () => {
  let service: SavingsAutoTransferService;
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
        SavingsAutoTransferService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SavingsAutoTransferService>(SavingsAutoTransferService);

    prisma.$transaction.mockImplementation(async (callback: any) =>
      callback({
        wallet: prisma.wallet,
        transaction: prisma.transaction,
        savingsDetail: prisma.savingsDetail,
      }),
    );
  });

  it('정기 적금이면 메인 계좌에서 자동 이체한다', async () => {
    const now = new Date('2026-03-22T08:00:00.000+09:00');

    prisma.wallet.findMany.mockResolvedValue([{ id: 'wallet-savings-1' }]);
    prisma.wallet.findUnique
      .mockResolvedValueOnce({
        id: 'wallet-savings-1',
        userId: 'user-1',
        balance: 30000n,
        user: {
          name: '홍길동',
        },
        savingsDetail: {
          walletId: 'wallet-savings-1',
          productType: 'FIXED',
          autoTransferAmount: 10000n,
          lastAutoTransferAt: null,
        },
      })
      .mockResolvedValueOnce({
        id: 'wallet-main-1',
        balance: 50000n,
      });

    await expect(service.applyDailyFixedAutoTransfer(now)).resolves.toEqual({
      processedAt: now,
      processedCount: 1,
      failedCount: 0,
    });

    expect(prisma.wallet.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: 'wallet-main-1' },
        data: {
          balance: {
            decrement: 10000n,
          },
        },
      }),
    );
    expect(prisma.wallet.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: 'wallet-savings-1' },
        data: {
          balance: {
            increment: 10000n,
          },
        },
      }),
    );
    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: {
        fromWalletId: 'wallet-main-1',
        toWalletId: 'wallet-savings-1',
        fromUserNameSnapshot: '홍길동',
        toUserNameSnapshot: '홍길동',
        amount: 10000n,
        type: 'MAIN_TO_SAVINGS',
        status: 'SUCCESS',
        description: '정기 적금 자동 이체',
      },
    });
    expect(prisma.savingsDetail.update).toHaveBeenCalledWith({
      where: {
        walletId: 'wallet-savings-1',
      },
      data: {
        lastAutoTransferAt: now,
      },
    });
  });

  it('메인 계좌 잔액이 부족하면 실패 거래만 남긴다', async () => {
    const now = new Date('2026-03-22T08:00:00.000+09:00');

    prisma.wallet.findMany.mockResolvedValue([{ id: 'wallet-savings-1' }]);
    prisma.wallet.findUnique
      .mockResolvedValueOnce({
        id: 'wallet-savings-1',
        userId: 'user-1',
        balance: 30000n,
        user: {
          name: '홍길동',
        },
        savingsDetail: {
          walletId: 'wallet-savings-1',
          productType: 'FIXED',
          autoTransferAmount: 10000n,
          lastAutoTransferAt: null,
        },
      })
      .mockResolvedValueOnce({
        id: 'wallet-main-1',
        balance: 5000n,
      });

    await expect(service.applyDailyFixedAutoTransfer(now)).resolves.toEqual({
      processedAt: now,
      processedCount: 0,
      failedCount: 1,
    });

    expect(prisma.wallet.update).not.toHaveBeenCalled();
    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: {
        fromWalletId: 'wallet-main-1',
        toWalletId: 'wallet-savings-1',
        fromUserNameSnapshot: '홍길동',
        toUserNameSnapshot: '홍길동',
        amount: 10000n,
        type: 'MAIN_TO_SAVINGS',
        status: 'FAILED',
        description: '정기 적금 자동 이체 실패',
      },
    });
    expect(prisma.savingsDetail.update).toHaveBeenCalledWith({
      where: {
        walletId: 'wallet-savings-1',
      },
      data: {
        lastAutoTransferAt: now,
      },
    });
  });

  it('오늘 이미 자동 이체를 시도한 적금은 건너뛴다', async () => {
    const now = new Date('2026-03-22T08:00:00.000+09:00');

    prisma.wallet.findMany.mockResolvedValue([{ id: 'wallet-savings-1' }]);
    prisma.wallet.findUnique.mockResolvedValueOnce({
      id: 'wallet-savings-1',
      userId: 'user-1',
      balance: 30000n,
      user: {
        name: '홍길동',
      },
      savingsDetail: {
        walletId: 'wallet-savings-1',
        productType: 'FIXED',
        autoTransferAmount: 10000n,
        lastAutoTransferAt: new Date('2026-03-22T00:30:00.000+09:00'),
      },
    });

    await expect(service.applyDailyFixedAutoTransfer(now)).resolves.toEqual({
      processedAt: now,
      processedCount: 0,
      failedCount: 0,
    });

    expect(prisma.transaction.create).not.toHaveBeenCalled();
    expect(prisma.wallet.update).not.toHaveBeenCalled();
    expect(prisma.savingsDetail.update).not.toHaveBeenCalled();
  });
});
