import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

type WalletSummary = {
  id: string;
  type: 'MAIN' | 'SAVINGS';
  balance: bigint;
  currency: string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
};

const walletSummarySelect = {
  id: true,
  type: true,
  balance: true,
  currency: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const transactionSummarySelect = {
  id: true,
  amount: true,
  type: true,
  status: true,
  description: true,
  createdAt: true,
} as const;

const DAILY_MAIN_WALLET_DEPOSIT_LIMIT = 3_000_000n;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getKstDayRange(now: Date) {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const startMs =
    Date.UTC(
      kstNow.getUTCFullYear(),
      kstNow.getUTCMonth(),
      kstNow.getUTCDate(),
    ) - KST_OFFSET_MS;

  return {
    start: new Date(startMs),
    end: new Date(startMs + ONE_DAY_MS),
  };
}

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createSavingsWallet(userId: string) {
    const existingSavingsWallet = await this.prisma.wallet.findUnique({
      where: {
        userId_type: {
          userId,
          type: 'SAVINGS',
        },
      },
      select: { id: true },
    });

    if (existingSavingsWallet) {
      throw new BadRequestException('적금 계좌가 이미 존재합니다.');
    }

    return this.prisma.wallet.create({
      data: {
        userId,
        type: 'SAVINGS',
      },
      select: walletSummarySelect,
    });
  }

  async depositToMainWallet(userId: string, amount: number) {
    const depositAmount = BigInt(amount);
    const { start, end } = getKstDayRange(new Date());

    return this.prisma.$transaction(
      async (tx) => {
        const mainWallet = await tx.wallet.findUnique({
          where: {
            userId_type: {
              userId,
              type: 'MAIN',
            },
          },
          select: walletSummarySelect,
        });

        if (!mainWallet) {
          throw new NotFoundException('메인 계좌를 찾을 수 없습니다.');
        }

        const todayDepositAmount = await tx.transaction.aggregate({
          where: {
            toWalletId: mainWallet.id,
            type: 'SELF_DEPOSIT',
            status: 'SUCCESS',
            createdAt: {
              gte: start,
              lt: end,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const accumulatedDepositAmount = todayDepositAmount._sum.amount ?? 0n;

        if (
          accumulatedDepositAmount + depositAmount >
          DAILY_MAIN_WALLET_DEPOSIT_LIMIT
        ) {
          throw new BadRequestException(
            '1일 직접 충전 한도를 초과했습니다.',
          );
        }

        const updatedMainWallet = await tx.wallet.update({
          where: { id: mainWallet.id },
          data: {
            balance: {
              increment: depositAmount,
            },
          },
          select: walletSummarySelect,
        });

        const transaction = await tx.transaction.create({
          data: {
            fromWalletId: null,
            toWalletId: mainWallet.id,
            amount: depositAmount,
            type: 'SELF_DEPOSIT',
            status: 'SUCCESS',
            description: '본인 직접 충전',
          },
          select: transactionSummarySelect,
        });

        return {
          wallet: updatedMainWallet,
          transaction,
          remainingDailyLimit:
            DAILY_MAIN_WALLET_DEPOSIT_LIMIT -
            (accumulatedDepositAmount + depositAmount),
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async transferMainToSavings(userId: string, amount: number) {
    const transferAmount = BigInt(amount);

    return this.prisma.$transaction(
      async (tx) => {
        const mainWallet = await tx.wallet.findUnique({
          where: {
            userId_type: {
              userId,
              type: 'MAIN',
            },
          },
          select: walletSummarySelect,
        });

        if (!mainWallet) {
          throw new NotFoundException('메인 계좌를 찾을 수 없습니다.');
        }

        const savingsWallet = await tx.wallet.findUnique({
          where: {
            userId_type: {
              userId,
              type: 'SAVINGS',
            },
          },
          select: walletSummarySelect,
        });

        if (!savingsWallet) {
          throw new NotFoundException('적금 계좌를 찾을 수 없습니다.');
        }

        if (mainWallet.balance < transferAmount) {
          throw new BadRequestException('메인 계좌 잔액이 부족합니다.');
        }

        const updatedMainWallet = await tx.wallet.update({
          where: { id: mainWallet.id },
          data: {
            balance: {
              decrement: transferAmount,
            },
          },
          select: walletSummarySelect,
        });

        const updatedSavingsWallet = await tx.wallet.update({
          where: { id: savingsWallet.id },
          data: {
            balance: {
              increment: transferAmount,
            },
          },
          select: walletSummarySelect,
        });

        const transaction = await tx.transaction.create({
          data: {
            fromWalletId: mainWallet.id,
            toWalletId: savingsWallet.id,
            amount: transferAmount,
            type: 'MAIN_TO_SAVINGS',
            status: 'SUCCESS',
            description: '메인 계좌에서 적금 계좌로 이체',
          },
          select: transactionSummarySelect,
        });

        return {
          mainWallet: updatedMainWallet,
          savingsWallet: updatedSavingsWallet,
          transaction,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async transferToUserMainWallet(
    fromUserId: string,
    toEmail: string,
    amount: number,
  ) {
    const transferAmount = BigInt(amount);
    const recipient = await this.userService.getUserByEmail(toEmail);

    if (!recipient) {
      throw new NotFoundException('받는 사용자를 찾을 수 없습니다.');
    }

    if (recipient.id === fromUserId) {
      throw new BadRequestException('본인에게 송금할 수 없습니다.');
    }

    return this.prisma.$transaction(
      async (tx) => {
        const senderMainWallet = await tx.wallet.findUnique({
          where: {
            userId_type: {
              userId: fromUserId,
              type: 'MAIN',
            },
          },
          select: walletSummarySelect,
        });

        if (!senderMainWallet) {
          throw new NotFoundException('보내는 메인 계좌를 찾을 수 없습니다.');
        }

        const recipientMainWallet = await tx.wallet.findUnique({
          where: {
            userId_type: {
              userId: recipient.id,
              type: 'MAIN',
            },
          },
          select: walletSummarySelect,
        });

        if (!recipientMainWallet) {
          throw new NotFoundException('받는 메인 계좌를 찾을 수 없습니다.');
        }

        if (senderMainWallet.balance < transferAmount) {
          throw new BadRequestException('메인 계좌 잔액이 부족합니다.');
        }

        const updatedSenderMainWallet = await tx.wallet.update({
          where: { id: senderMainWallet.id },
          data: {
            balance: {
              decrement: transferAmount,
            },
          },
          select: walletSummarySelect,
        });

        const updatedRecipientMainWallet = await tx.wallet.update({
          where: { id: recipientMainWallet.id },
          data: {
            balance: {
              increment: transferAmount,
            },
          },
          select: walletSummarySelect,
        });

        const transaction = await tx.transaction.create({
          data: {
            fromWalletId: senderMainWallet.id,
            toWalletId: recipientMainWallet.id,
            amount: transferAmount,
            type: 'USER_TRANSFER',
            status: 'SUCCESS',
            description: '사용자 간 메인 계좌 송금',
          },
          select: transactionSummarySelect,
        });

        return {
          fromWallet: updatedSenderMainWallet,
          toWallet: updatedRecipientMainWallet,
          transaction,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async getUserWallets(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      select: walletSummarySelect,
      orderBy: { createdAt: 'asc' },
    });

    return {
      mainWallet: wallets.find((wallet) => wallet.type === 'MAIN') ?? null,
      savingsWallet:
        wallets.find((wallet) => wallet.type === 'SAVINGS') ?? null,
    } satisfies {
      mainWallet: WalletSummary | null;
      savingsWallet: WalletSummary | null;
    };
  }
}
