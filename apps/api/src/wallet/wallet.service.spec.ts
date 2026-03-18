import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: {
    $transaction: jest.Mock;
    wallet: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    transaction: {
      aggregate: jest.Mock;
      create: jest.Mock;
    };
  };
  let userService: {
    getUserByEmail: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      wallet: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        aggregate: jest.fn(),
        create: jest.fn(),
      },
    };
    userService = {
      getUserByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);

    prisma.$transaction.mockImplementation(async (callback: any) =>
      callback({
        wallet: prisma.wallet,
        transaction: prisma.transaction,
      }),
    );
  });

  it('deposits money into the main wallet when under the daily limit', async () => {
    const mainWallet = {
      id: 'wallet-main',
      type: 'MAIN',
      balance: 1000n,
      currency: 'KRW',
      status: 'ACTIVE',
      createdAt: new Date('2026-03-17T00:00:00.000Z'),
      updatedAt: new Date('2026-03-17T00:00:00.000Z'),
    };
    const updatedMainWallet = {
      ...mainWallet,
      balance: 51000n,
    };
    const transaction = {
      id: 'tx-1',
      amount: 50000n,
      type: 'SELF_DEPOSIT',
      status: 'SUCCESS',
      description: '본인 직접 충전',
      createdAt: new Date('2026-03-17T03:00:00.000Z'),
    };

    prisma.wallet.findUnique.mockResolvedValue(mainWallet);
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: {
        amount: 100000n,
      },
    });
    prisma.wallet.update.mockResolvedValue(updatedMainWallet);
    prisma.transaction.create.mockResolvedValue(transaction);

    await expect(service.depositToMainWallet('user-1', 50000)).resolves.toEqual({
      wallet: updatedMainWallet,
      transaction,
      remainingDailyLimit: 2_850_000n,
    });
  });

  it('transfers money from the main wallet to the savings wallet', async () => {
    const mainWallet = {
      id: 'wallet-main',
      type: 'MAIN',
      balance: 100000n,
      currency: 'KRW',
      status: 'ACTIVE',
      createdAt: new Date('2026-03-17T00:00:00.000Z'),
      updatedAt: new Date('2026-03-17T00:00:00.000Z'),
    };
    const savingsWallet = {
      id: 'wallet-savings',
      type: 'SAVINGS',
      balance: 5000n,
      currency: 'KRW',
      status: 'ACTIVE',
      createdAt: new Date('2026-03-17T00:10:00.000Z'),
      updatedAt: new Date('2026-03-17T00:10:00.000Z'),
    };
    const updatedMainWallet = {
      ...mainWallet,
      balance: 70000n,
    };
    const updatedSavingsWallet = {
      ...savingsWallet,
      balance: 35000n,
    };
    const transaction = {
      id: 'tx-transfer-1',
      amount: 30000n,
      type: 'MAIN_TO_SAVINGS',
      status: 'SUCCESS',
      description: '메인 계좌에서 적금 계좌로 이체',
      createdAt: new Date('2026-03-17T03:10:00.000Z'),
    };

    prisma.wallet.findUnique
      .mockResolvedValueOnce(mainWallet)
      .mockResolvedValueOnce(savingsWallet);
    prisma.wallet.update
      .mockResolvedValueOnce(updatedMainWallet)
      .mockResolvedValueOnce(updatedSavingsWallet);
    prisma.transaction.create.mockResolvedValue(transaction);

    await expect(
      service.transferMainToSavings('user-1', 30000),
    ).resolves.toEqual({
      mainWallet: updatedMainWallet,
      savingsWallet: updatedSavingsWallet,
      transaction,
    });
  });

  it('transfers money to another user main wallet when the sender has enough balance', async () => {
    const senderMainWallet = {
      id: 'wallet-main-1',
      type: 'MAIN',
      balance: 100000n,
      currency: 'KRW',
      status: 'ACTIVE',
      createdAt: new Date('2026-03-17T00:00:00.000Z'),
      updatedAt: new Date('2026-03-17T00:00:00.000Z'),
    };
    const recipientMainWallet = {
      id: 'wallet-main-2',
      type: 'MAIN',
      balance: 5000n,
      currency: 'KRW',
      status: 'ACTIVE',
      createdAt: new Date('2026-03-17T00:10:00.000Z'),
      updatedAt: new Date('2026-03-17T00:10:00.000Z'),
    };
    const updatedSenderMainWallet = {
      ...senderMainWallet,
      balance: 70000n,
    };
    const updatedRecipientMainWallet = {
      ...recipientMainWallet,
      balance: 35000n,
    };
    const transaction = {
      id: 'tx-user-transfer-1',
      amount: 30000n,
      type: 'USER_TRANSFER',
      status: 'SUCCESS',
      description: '사용자 간 메인 계좌 송금',
      createdAt: new Date('2026-03-17T03:30:00.000Z'),
    };

    userService.getUserByEmail.mockResolvedValue({
      id: 'user-2',
      email: 'friend@example.com',
    });
    prisma.wallet.findUnique
      .mockResolvedValueOnce(senderMainWallet)
      .mockResolvedValueOnce(recipientMainWallet);
    prisma.wallet.update
      .mockResolvedValueOnce(updatedSenderMainWallet)
      .mockResolvedValueOnce(updatedRecipientMainWallet);
    prisma.transaction.create.mockResolvedValue(transaction);

    await expect(
      service.transferToUserMainWallet('user-1', 'friend@example.com', 30000),
    ).resolves.toEqual({
      fromWallet: updatedSenderMainWallet,
      toWallet: updatedRecipientMainWallet,
      transaction,
    });
  });

  it('throws when trying to transfer to yourself', async () => {
    userService.getUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'me@example.com',
    });

    await expect(
      service.transferToUserMainWallet('user-1', 'me@example.com', 1000),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when the sender balance is insufficient for user transfer', async () => {
    userService.getUserByEmail.mockResolvedValue({
      id: 'user-2',
      email: 'friend@example.com',
    });
    prisma.wallet.findUnique
      .mockResolvedValueOnce({
        id: 'wallet-main-1',
        type: 'MAIN',
        balance: 10000n,
        currency: 'KRW',
        status: 'ACTIVE',
        createdAt: new Date('2026-03-17T00:00:00.000Z'),
        updatedAt: new Date('2026-03-17T00:00:00.000Z'),
      })
      .mockResolvedValueOnce({
        id: 'wallet-main-2',
        type: 'MAIN',
        balance: 5000n,
        currency: 'KRW',
        status: 'ACTIVE',
        createdAt: new Date('2026-03-17T00:10:00.000Z'),
        updatedAt: new Date('2026-03-17T00:10:00.000Z'),
      });

    await expect(
      service.transferToUserMainWallet('user-1', 'friend@example.com', 30000),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates a savings wallet for the current user', async () => {
    const createdWallet = {
      id: 'wallet-savings',
      type: 'SAVINGS',
      balance: 0n,
      currency: 'KRW',
      status: 'ACTIVE',
      createdAt: new Date('2026-03-17T00:01:00.000Z'),
      updatedAt: new Date('2026-03-17T00:01:00.000Z'),
    };
    prisma.wallet.findUnique.mockResolvedValue(null);
    prisma.wallet.create.mockResolvedValue(createdWallet);

    await expect(service.createSavingsWallet('user-1')).resolves.toEqual(
      createdWallet,
    );
  });

  it('returns the current user main and savings wallets', async () => {
    const wallets = [
      {
        id: 'wallet-main',
        type: 'MAIN',
        balance: 1000n,
        currency: 'KRW',
        status: 'ACTIVE',
        createdAt: new Date('2026-03-17T00:00:00.000Z'),
        updatedAt: new Date('2026-03-17T00:00:00.000Z'),
      },
      {
        id: 'wallet-savings',
        type: 'SAVINGS',
        balance: 300n,
        currency: 'KRW',
        status: 'ACTIVE',
        createdAt: new Date('2026-03-17T00:01:00.000Z'),
        updatedAt: new Date('2026-03-17T00:01:00.000Z'),
      },
    ];
    prisma.wallet.findMany.mockResolvedValue(wallets);

    await expect(service.getUserWallets('user-1')).resolves.toEqual({
      mainWallet: wallets[0],
      savingsWallet: wallets[1],
    });
  });
});
