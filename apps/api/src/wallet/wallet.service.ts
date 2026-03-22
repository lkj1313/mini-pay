import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getKstDayRange } from '../common/utils/date-range.util';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { CreateSavingsWalletDto } from './dto/create-savings-wallet.dto';

type WalletSummary = {
  id: string;
  type: 'MAIN' | 'SAVINGS';
  balance: bigint;
  currency: string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
};

type SerializedWalletSummary = Omit<WalletSummary, 'balance'> & {
  balance: string;
};

type SavingsDetailSummary = {
  productType: 'FREE' | 'FIXED';
  annualInterestRate: Prisma.Decimal;
  autoTransferAmount: bigint | null;
  startedAt: Date;
  maturityAt: Date | null;
  lastInterestAppliedAt: Date | null;
  lastAutoTransferAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type SerializedSavingsDetailSummary = Omit<
  SavingsDetailSummary,
  'annualInterestRate' | 'autoTransferAmount'
> & {
  annualInterestRate: string;
  autoTransferAmount: string | null;
};

type WalletWithSavingsDetailSummary = WalletSummary & {
  savingsDetail: SavingsDetailSummary | null;
};

type SerializedWalletWithSavingsDetailSummary = Omit<
  SerializedWalletSummary,
  'balance'
> & {
  balance: string;
  savingsDetail: SerializedSavingsDetailSummary | null;
};

type TransactionSummary = {
  id: string;
  amount: bigint;
  type:
    | 'SELF_DEPOSIT'
    | 'USER_TRANSFER'
    | 'MAIN_TO_SAVINGS'
    | 'SAVINGS_INTEREST';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED';
  description: string | null;
  createdAt: Date;
};

type SerializedTransactionSummary = Omit<TransactionSummary, 'amount'> & {
  amount: string;
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

const savingsDetailSelect = {
  productType: true,
  annualInterestRate: true,
  autoTransferAmount: true,
  startedAt: true,
  maturityAt: true,
  lastInterestAppliedAt: true,
  lastAutoTransferAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const DAILY_MAIN_WALLET_DEPOSIT_LIMIT = 3_000_000n;
const AUTO_TOP_UP_UNIT = 10_000n;
const FREE_SAVINGS_INTEREST_RATE = '0.0300';
const FIXED_SAVINGS_INTEREST_RATE = '0.0500';

function serializeWallet(wallet: WalletSummary): SerializedWalletSummary {
  return {
    ...wallet,
    balance: wallet.balance.toString(),
  };
}

function serializeSavingsDetail(
  savingsDetail: SavingsDetailSummary,
): SerializedSavingsDetailSummary {
  return {
    ...savingsDetail,
    annualInterestRate: savingsDetail.annualInterestRate.toString(),
    autoTransferAmount:
      savingsDetail.autoTransferAmount?.toString() ?? null,
  };
}

function serializeWalletWithSavingsDetail(
  wallet: WalletWithSavingsDetailSummary,
): SerializedWalletWithSavingsDetailSummary {
  return {
    ...wallet,
    balance: wallet.balance.toString(),
    savingsDetail: wallet.savingsDetail
      ? serializeSavingsDetail(wallet.savingsDetail)
      : null,
  };
}

function serializeTransaction(
  transaction: TransactionSummary,
): SerializedTransactionSummary {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
  };
}

function roundUpToAutoTopUpUnit(amount: bigint) {
  if (amount <= 0n) {
    return 0n;
  }

  return ((amount + AUTO_TOP_UP_UNIT - 1n) / AUTO_TOP_UP_UNIT) * AUTO_TOP_UP_UNIT;
}

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createSavingsWallet(userId: string, dto?: CreateSavingsWalletDto) {
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

    const productType = dto?.productType ?? 'FREE';

    if (productType === 'FIXED' && !dto?.autoTransferAmount) {
      throw new BadRequestException(
        '정기 적금은 자동 이체 금액이 필요합니다.',
      );
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        type: 'SAVINGS',
        savingsDetail: {
          create: {
            productType,
            annualInterestRate:
              productType === 'FIXED'
                ? FIXED_SAVINGS_INTEREST_RATE
                : FREE_SAVINGS_INTEREST_RATE,
            autoTransferAmount:
              productType === 'FIXED'
                ? BigInt(dto?.autoTransferAmount ?? 0)
                : null,
          },
        },
      },
      select: {
        ...walletSummarySelect,
        savingsDetail: {
          select: savingsDetailSelect,
        },
      },
    });

    return serializeWalletWithSavingsDetail(wallet);
  }

  async depositToMainWallet(userId: string, amount: number) {
    const depositAmount = BigInt(amount);
    const { start, end } = getKstDayRange(new Date());
    const currentUser = await this.userService.findOne(userId);

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
          throw new BadRequestException('1일 직접 충전 한도를 초과했습니다.');
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
            fromUserNameSnapshot: null,
            toUserNameSnapshot: currentUser.name,
            amount: depositAmount,
            type: 'SELF_DEPOSIT',
            status: 'SUCCESS',
            description: '본인 직접 충전',
          },
          select: transactionSummarySelect,
        });

        return {
          wallet: serializeWallet(updatedMainWallet),
          transaction: serializeTransaction(transaction),
          remainingDailyLimit: (
            DAILY_MAIN_WALLET_DEPOSIT_LIMIT -
            (accumulatedDepositAmount + depositAmount)
          ).toString(),
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async transferMainToSavings(userId: string, amount: number) {
    const transferAmount = BigInt(amount);
    const currentUser = await this.userService.findOne(userId);

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
            fromUserNameSnapshot: currentUser.name,
            toUserNameSnapshot: currentUser.name,
            amount: transferAmount,
            type: 'MAIN_TO_SAVINGS',
            status: 'SUCCESS',
            description: '메인 계좌에서 적금 계좌로 이체',
          },
          select: transactionSummarySelect,
        });

        return {
          mainWallet: serializeWallet(updatedMainWallet),
          savingsWallet: serializeWallet(updatedSavingsWallet),
          transaction: serializeTransaction(transaction),
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
    const sender = await this.userService.findOne(fromUserId);
    const { start, end } = getKstDayRange(new Date());

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

        let availableSenderMainWallet = senderMainWallet;

        if (senderMainWallet.balance < transferAmount) {
          const shortfall = transferAmount - senderMainWallet.balance;
          const autoDepositAmount = roundUpToAutoTopUpUnit(shortfall);

          const todayDepositAmount = await tx.transaction.aggregate({
            where: {
              toWalletId: senderMainWallet.id,
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
            accumulatedDepositAmount + autoDepositAmount >
            DAILY_MAIN_WALLET_DEPOSIT_LIMIT
          ) {
            throw new BadRequestException('1일 직접 충전 한도를 초과했습니다.');
          }

          availableSenderMainWallet = await tx.wallet.update({
            where: { id: senderMainWallet.id },
            data: {
              balance: {
                increment: autoDepositAmount,
              },
            },
            select: walletSummarySelect,
          });

          await tx.transaction.create({
            data: {
              fromWalletId: null,
              toWalletId: senderMainWallet.id,
              fromUserNameSnapshot: null,
              toUserNameSnapshot: sender.name,
              amount: autoDepositAmount,
              type: 'SELF_DEPOSIT',
              status: 'SUCCESS',
              description: '자동 충전',
            },
            select: transactionSummarySelect,
          });
        }

        const updatedSenderMainWallet = await tx.wallet.update({
          where: { id: availableSenderMainWallet.id },
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
            fromWalletId: availableSenderMainWallet.id,
            toWalletId: recipientMainWallet.id,
            fromUserNameSnapshot: sender.name,
            toUserNameSnapshot: recipient.name,
            amount: transferAmount,
            type: 'USER_TRANSFER',
            status: 'SUCCESS',
            description: '사용자 간 메인 계좌 송금',
          },
          select: transactionSummarySelect,
        });

        return {
          fromWallet: serializeWallet(updatedSenderMainWallet),
          toWallet: serializeWallet(updatedRecipientMainWallet),
          transaction: serializeTransaction(transaction),
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
      select: {
        ...walletSummarySelect,
        savingsDetail: {
          select: savingsDetailSelect,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const mainWallet = wallets.find((wallet) => wallet.type === 'MAIN') ?? null;
    const savingsWallet =
      wallets.find((wallet) => wallet.type === 'SAVINGS') ?? null;

    return {
      mainWallet: mainWallet ? serializeWalletWithSavingsDetail(mainWallet) : null,
      savingsWallet: savingsWallet
        ? serializeWalletWithSavingsDetail(savingsWallet)
        : null,
    } satisfies {
      mainWallet: SerializedWalletWithSavingsDetailSummary | null;
      savingsWallet: SerializedWalletWithSavingsDetailSummary | null;
    };
  }
}
