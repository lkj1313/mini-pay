import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: {
    wallet: {
      findMany: jest.Mock;
    };
    transaction: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      wallet: {
        findMany: jest.fn(),
      },
      transaction: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('거래내역 조회 시 snapshot 이름을 우선 사용한다', async () => {
    prisma.wallet.findMany.mockResolvedValue([
      { id: 'wallet-main' },
      { id: 'wallet-savings' },
    ]);
    prisma.transaction.findMany.mockResolvedValue([
      {
        id: 'tx-1',
        fromWalletId: null,
        toWalletId: 'wallet-main',
        fromUserNameSnapshot: null,
        toUserNameSnapshot: '홍길동',
        fromWallet: null,
        toWallet: {
          type: 'MAIN',
          user: {
            id: 'user-1',
            name: '현재이름',
          },
        },
        amount: 50000n,
        type: 'SELF_DEPOSIT',
        status: 'SUCCESS',
        description: '본인 직접 충전',
        createdAt: new Date('2026-03-18T00:00:00.000Z'),
      },
      {
        id: 'tx-2',
        fromWalletId: 'wallet-main',
        toWalletId: 'wallet-savings',
        fromUserNameSnapshot: '홍길동',
        toUserNameSnapshot: '홍길동',
        fromWallet: {
          type: 'MAIN',
          user: {
            id: 'user-1',
            name: '현재이름',
          },
        },
        toWallet: {
          type: 'SAVINGS',
          user: {
            id: 'user-1',
            name: '현재이름',
          },
        },
        amount: 30000n,
        type: 'MAIN_TO_SAVINGS',
        status: 'SUCCESS',
        description: '메인 계좌에서 적금 계좌로 이체',
        createdAt: new Date('2026-03-18T00:10:00.000Z'),
      },
      {
        id: 'tx-3',
        fromWalletId: 'wallet-friend',
        toWalletId: 'wallet-main',
        fromUserNameSnapshot: '옛친구이름',
        toUserNameSnapshot: '홍길동',
        fromWallet: {
          type: 'MAIN',
          user: {
            id: 'user-2',
            name: '지금친구이름',
          },
        },
        toWallet: {
          type: 'MAIN',
          user: {
            id: 'user-1',
            name: '현재이름',
          },
        },
        amount: 15000n,
        type: 'USER_TRANSFER',
        status: 'SUCCESS',
        description: '사용자 간 메인 계좌 송금',
        createdAt: new Date('2026-03-18T00:20:00.000Z'),
      },
      {
        id: 'tx-4',
        fromWalletId: 'wallet-friend',
        toWalletId: 'wallet-main',
        fromUserNameSnapshot: null,
        toUserNameSnapshot: null,
        fromWallet: {
          type: 'MAIN',
          user: {
            id: 'user-2',
            name: 'fallback친구',
          },
        },
        toWallet: {
          type: 'MAIN',
          user: {
            id: 'user-1',
            name: 'fallback나',
          },
        },
        amount: 9000n,
        type: 'USER_TRANSFER',
        status: 'SUCCESS',
        description: '예전 거래',
        createdAt: new Date('2026-03-18T00:30:00.000Z'),
      },
    ]);

    await expect(service.getMyTransactions('user-1')).resolves.toEqual([
      {
        id: 'tx-1',
        fromWalletId: null,
        toWalletId: 'wallet-main',
        amount: '50000',
        type: 'SELF_DEPOSIT',
        status: 'SUCCESS',
        description: '본인 직접 충전',
        createdAt: new Date('2026-03-18T00:00:00.000Z'),
        fromUserName: null,
        toUserName: '홍길동',
        counterpartyName: '본인',
      },
      {
        id: 'tx-2',
        fromWalletId: 'wallet-main',
        toWalletId: 'wallet-savings',
        amount: '30000',
        type: 'MAIN_TO_SAVINGS',
        status: 'SUCCESS',
        description: '메인 계좌에서 적금 계좌로 이체',
        createdAt: new Date('2026-03-18T00:10:00.000Z'),
        fromUserName: '홍길동',
        toUserName: '홍길동',
        counterpartyName: '내 적금 계좌',
      },
      {
        id: 'tx-3',
        fromWalletId: 'wallet-friend',
        toWalletId: 'wallet-main',
        amount: '15000',
        type: 'USER_TRANSFER',
        status: 'SUCCESS',
        description: '사용자 간 메인 계좌 송금',
        createdAt: new Date('2026-03-18T00:20:00.000Z'),
        fromUserName: '옛친구이름',
        toUserName: '홍길동',
        counterpartyName: '옛친구이름',
      },
      {
        id: 'tx-4',
        fromWalletId: 'wallet-friend',
        toWalletId: 'wallet-main',
        amount: '9000',
        type: 'USER_TRANSFER',
        status: 'SUCCESS',
        description: '예전 거래',
        createdAt: new Date('2026-03-18T00:30:00.000Z'),
        fromUserName: 'fallback친구',
        toUserName: 'fallback나',
        counterpartyName: 'fallback친구',
      },
    ]);

    expect(prisma.wallet.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      select: { id: true },
    });
    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            fromWalletId: {
              in: ['wallet-main', 'wallet-savings'],
            },
          },
          {
            toWalletId: {
              in: ['wallet-main', 'wallet-savings'],
            },
          },
        ],
      },
      select: {
        id: true,
        fromWalletId: true,
        toWalletId: true,
        fromUserNameSnapshot: true,
        toUserNameSnapshot: true,
        fromWallet: {
          select: {
            type: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        toWallet: {
          select: {
            type: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        amount: true,
        type: true,
        status: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('지갑이 없으면 빈 거래내역을 반환한다', async () => {
    prisma.wallet.findMany.mockResolvedValue([]);

    await expect(service.getMyTransactions('user-1')).resolves.toEqual([]);
    expect(prisma.transaction.findMany).not.toHaveBeenCalled();
  });
});
