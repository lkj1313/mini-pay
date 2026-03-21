import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const transactionSummarySelect = {
  id: true,
  fromWalletId: true,
  toWalletId: true,
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
} as const;

function serializeTransactionAmount(amount: bigint) {
  return amount.toString();
}

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyTransactions(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      select: { id: true },
    });

    const walletIds = wallets.map((wallet) => wallet.id);

    if (walletIds.length === 0) {
      return [];
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          {
            fromWalletId: {
              in: walletIds,
            },
          },
          {
            toWalletId: {
              in: walletIds,
            },
          },
        ],
      },
      select: transactionSummarySelect,
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((transaction) => {
      const isOutgoing =
        transaction.fromWalletId !== null &&
        transaction.fromWallet?.user.id === userId;

      let counterpartyName: string;

      if (transaction.type === 'SELF_DEPOSIT') {
        counterpartyName = '본인';
      } else if (transaction.type === 'MAIN_TO_SAVINGS') {
        counterpartyName = isOutgoing ? '내 적금 계좌' : '내 메인 계좌';
      } else {
        counterpartyName = isOutgoing
          ? transaction.toWallet.user.name
          : (transaction.fromWallet?.user.name ?? '알 수 없음');
      }

      return {
        id: transaction.id,
        fromWalletId: transaction.fromWalletId,
        toWalletId: transaction.toWalletId,
        amount: serializeTransactionAmount(transaction.amount),
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.createdAt,
        fromUserName: transaction.fromWallet?.user.name ?? null,
        toUserName: transaction.toWallet.user.name,
        counterpartyName,
      };
    });
  }
}
