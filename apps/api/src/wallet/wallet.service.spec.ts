import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
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
    findOne: jest.Mock;
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
      findOne: jest.fn(),
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

  it('일일 한도 이내면 메인 계좌에 직접 충전한다', async () => {
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
    userService.findOne.mockResolvedValue({
      id: 'user-1',
      name: '홍길동',
    });
    prisma.wallet.update.mockResolvedValue(updatedMainWallet);
    prisma.transaction.create.mockResolvedValue(transaction);

    await expect(service.depositToMainWallet('user-1', 50000)).resolves.toEqual(
      {
        wallet: {
          ...updatedMainWallet,
          balance: '51000',
        },
        transaction: {
          ...transaction,
          amount: '50000',
        },
        remainingDailyLimit: '2850000',
      },
    );
  });

  it('메인 계좌에서 적금 계좌로 이체한다', async () => {
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
    userService.findOne.mockResolvedValue({
      id: 'user-1',
      name: '홍길동',
    });
    prisma.wallet.update
      .mockResolvedValueOnce(updatedMainWallet)
      .mockResolvedValueOnce(updatedSavingsWallet);
    prisma.transaction.create.mockResolvedValue(transaction);

    await expect(
      service.transferMainToSavings('user-1', 30000),
    ).resolves.toEqual({
      mainWallet: {
        ...updatedMainWallet,
        balance: '70000',
      },
      savingsWallet: {
        ...updatedSavingsWallet,
        balance: '35000',
      },
      transaction: {
        ...transaction,
        amount: '30000',
      },
    });
  });

  it('잔액이 충분하면 다른 사용자 메인 계좌로 바로 송금한다', async () => {
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
      name: '친구',
    });
    userService.findOne.mockResolvedValue({
      id: 'user-1',
      name: '홍길동',
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
      fromWallet: {
        ...updatedSenderMainWallet,
        balance: '70000',
      },
      toWallet: {
        ...updatedRecipientMainWallet,
        balance: '35000',
      },
      transaction: {
        ...transaction,
        amount: '30000',
      },
    });
  });

  it('잔액이 부족하면 1만원 단위로 자동 충전 후 송금한다', async () => {
    const senderMainWallet = {
      id: 'wallet-main-1',
      type: 'MAIN',
      balance: 12000n,
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
    const autoDepositedSenderMainWallet = {
      ...senderMainWallet,
      balance: 32000n,
    };
    const updatedSenderMainWallet = {
      ...senderMainWallet,
      balance: 7000n,
    };
    const updatedRecipientMainWallet = {
      ...recipientMainWallet,
      balance: 30000n,
    };
    const autoDepositTransaction = {
      id: 'tx-auto-deposit-1',
      amount: 20000n,
      type: 'SELF_DEPOSIT',
      status: 'SUCCESS',
      description: '자동 충전',
      createdAt: new Date('2026-03-17T03:20:00.000Z'),
    };
    const transferTransaction = {
      id: 'tx-user-transfer-2',
      amount: 25000n,
      type: 'USER_TRANSFER',
      status: 'SUCCESS',
      description: '사용자 간 메인 계좌 송금',
      createdAt: new Date('2026-03-17T03:21:00.000Z'),
    };

    userService.getUserByEmail.mockResolvedValue({
      id: 'user-2',
      email: 'friend@example.com',
      name: '친구',
    });
    userService.findOne.mockResolvedValue({
      id: 'user-1',
      name: '홍길동',
    });
    prisma.wallet.findUnique
      .mockResolvedValueOnce(senderMainWallet)
      .mockResolvedValueOnce(recipientMainWallet);
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: {
        amount: 100000n,
      },
    });
    prisma.wallet.update
      .mockResolvedValueOnce(autoDepositedSenderMainWallet)
      .mockResolvedValueOnce(updatedSenderMainWallet)
      .mockResolvedValueOnce(updatedRecipientMainWallet);
    prisma.transaction.create
      .mockResolvedValueOnce(autoDepositTransaction)
      .mockResolvedValueOnce(transferTransaction);

    await expect(
      service.transferToUserMainWallet('user-1', 'friend@example.com', 25000),
    ).resolves.toEqual({
      fromWallet: {
        ...updatedSenderMainWallet,
        balance: '7000',
      },
      toWallet: {
        ...updatedRecipientMainWallet,
        balance: '30000',
      },
      transaction: {
        ...transferTransaction,
        amount: '25000',
      },
    });

    expect(prisma.transaction.aggregate).toHaveBeenCalledTimes(1);
    expect(prisma.wallet.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: senderMainWallet.id },
        data: {
          balance: {
            increment: 20000n,
          },
        },
      }),
    );
    expect(prisma.transaction.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'SELF_DEPOSIT',
          amount: 20000n,
        }),
      }),
    );
    expect(prisma.transaction.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'USER_TRANSFER',
          amount: 25000n,
        }),
      }),
    );
  });

  it('자동 충전까지 포함해 한도를 넘기면 송금을 막는다', async () => {
    userService.getUserByEmail.mockResolvedValue({
      id: 'user-2',
      email: 'friend@example.com',
      name: '친구',
    });
    userService.findOne.mockResolvedValue({
      id: 'user-1',
      name: '홍길동',
    });
    prisma.wallet.findUnique
      .mockResolvedValueOnce({
        id: 'wallet-main-1',
        type: 'MAIN',
        balance: 12000n,
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
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: {
        amount: 2_990_000n,
      },
    });

    await expect(
      service.transferToUserMainWallet('user-1', 'friend@example.com', 25000),
    ).rejects.toThrow(BadRequestException);
  });

  it('본인에게 송금하려고 하면 예외를 던진다', async () => {
    userService.getUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'me@example.com',
      name: '홍길동',
    });

    await expect(
      service.transferToUserMainWallet('user-1', 'me@example.com', 1000),
    ).rejects.toThrow(BadRequestException);
  });

  it('현재 사용자용 적금 계좌를 생성한다', async () => {
    const createdWallet = {
      id: 'wallet-savings',
      type: 'SAVINGS',
      balance: 0n,
      currency: 'KRW',
      status: 'ACTIVE',
      savingsDetail: {
        productType: 'FREE',
        annualInterestRate: new Prisma.Decimal('0.0300'),
        autoTransferAmount: null,
        startedAt: new Date('2026-03-17T00:01:00.000Z'),
        maturityAt: null,
        lastInterestAppliedAt: null,
        lastAutoTransferAt: null,
        createdAt: new Date('2026-03-17T00:01:00.000Z'),
        updatedAt: new Date('2026-03-17T00:01:00.000Z'),
      },
      createdAt: new Date('2026-03-17T00:01:00.000Z'),
      updatedAt: new Date('2026-03-17T00:01:00.000Z'),
    };
    prisma.wallet.findUnique.mockResolvedValue(null);
    prisma.wallet.create.mockResolvedValue(createdWallet);

    await expect(service.createSavingsWallet('user-1')).resolves.toEqual({
      ...createdWallet,
      balance: '0',
      savingsDetail: {
        ...createdWallet.savingsDetail,
        annualInterestRate: '0.03',
        autoTransferAmount: null,
      },
    });
  });

  it('현재 사용자의 메인/적금 계좌를 조회한다', async () => {
    const wallets = [
      {
        id: 'wallet-main',
        type: 'MAIN',
        balance: 1000n,
        currency: 'KRW',
        status: 'ACTIVE',
        savingsDetail: null,
        createdAt: new Date('2026-03-17T00:00:00.000Z'),
        updatedAt: new Date('2026-03-17T00:00:00.000Z'),
      },
      {
        id: 'wallet-savings',
        type: 'SAVINGS',
        balance: 300n,
        currency: 'KRW',
        status: 'ACTIVE',
        savingsDetail: {
          productType: 'FREE',
          annualInterestRate: new Prisma.Decimal('0.0300'),
          autoTransferAmount: null,
          startedAt: new Date('2026-03-17T00:01:00.000Z'),
          maturityAt: null,
          lastInterestAppliedAt: null,
          lastAutoTransferAt: null,
          createdAt: new Date('2026-03-17T00:01:00.000Z'),
          updatedAt: new Date('2026-03-17T00:01:00.000Z'),
        },
        createdAt: new Date('2026-03-17T00:01:00.000Z'),
        updatedAt: new Date('2026-03-17T00:01:00.000Z'),
      },
    ];
    prisma.wallet.findMany.mockResolvedValue(wallets);

    await expect(service.getUserWallets('user-1')).resolves.toEqual({
      mainWallet: {
        ...wallets[0],
        balance: '1000',
      },
      savingsWallet: {
        ...wallets[1],
        balance: '300',
        savingsDetail: {
          ...wallets[1].savingsDetail,
          annualInterestRate: '0.03',
          autoTransferAmount: null,
        },
      },
    });
  });
});
