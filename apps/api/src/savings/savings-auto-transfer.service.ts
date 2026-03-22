import { Injectable } from '@nestjs/common';
import { getKstDayRange } from '../common/utils/date-range.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavingsAutoTransferService {
  constructor(private readonly prisma: PrismaService) {}

  async applyDailyFixedAutoTransfer(now = new Date()) {
    const { start, end } = getKstDayRange(now);

    const savingsWallets = await this.prisma.wallet.findMany({
      where: {
        type: 'SAVINGS',
        savingsDetail: {
          is: {
            productType: 'FIXED',
          },
        },
      },
      select: {
        id: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    let processedCount = 0;
    let failedCount = 0;

    for (const savingsWallet of savingsWallets) {
      const result = await this.prisma.$transaction(async (tx) => {
        const currentSavingsWallet = await tx.wallet.findUnique({
          where: { id: savingsWallet.id },
          select: {
            id: true,
            userId: true,
            balance: true,
            user: {
              select: {
                name: true,
              },
            },
            savingsDetail: {
              select: {
                walletId: true,
                productType: true,
                autoTransferAmount: true,
                lastAutoTransferAt: true,
              },
            },
          },
        });

        if (!currentSavingsWallet?.savingsDetail) {
          return 'skipped';
        }

        const {
          autoTransferAmount,
          lastAutoTransferAt,
          productType,
        } = currentSavingsWallet.savingsDetail;

        if (productType !== 'FIXED' || !autoTransferAmount) {
          return 'skipped';
        }

        if (
          lastAutoTransferAt &&
          lastAutoTransferAt >= start &&
          lastAutoTransferAt < end
        ) {
          return 'skipped';
        }

        const mainWallet = await tx.wallet.findUnique({
          where: {
            userId_type: {
              userId: currentSavingsWallet.userId,
              type: 'MAIN',
            },
          },
          select: {
            id: true,
            balance: true,
          },
        });

        if (!mainWallet) {
          return 'skipped';
        }

        if (mainWallet.balance < autoTransferAmount) {
          await tx.transaction.create({
            data: {
              fromWalletId: mainWallet.id,
              toWalletId: currentSavingsWallet.id,
              fromUserNameSnapshot: currentSavingsWallet.user.name,
              toUserNameSnapshot: currentSavingsWallet.user.name,
              amount: autoTransferAmount,
              type: 'MAIN_TO_SAVINGS',
              status: 'FAILED',
              description: '정기 적금 자동 이체 실패',
            },
          });

          await tx.savingsDetail.update({
            where: {
              walletId: currentSavingsWallet.id,
            },
            data: {
              lastAutoTransferAt: now,
            },
          });

          return 'failed';
        }

        await tx.wallet.update({
          where: { id: mainWallet.id },
          data: {
            balance: {
              decrement: autoTransferAmount,
            },
          },
        });

        await tx.wallet.update({
          where: { id: currentSavingsWallet.id },
          data: {
            balance: {
              increment: autoTransferAmount,
            },
          },
        });

        await tx.transaction.create({
          data: {
            fromWalletId: mainWallet.id,
            toWalletId: currentSavingsWallet.id,
            fromUserNameSnapshot: currentSavingsWallet.user.name,
            toUserNameSnapshot: currentSavingsWallet.user.name,
            amount: autoTransferAmount,
            type: 'MAIN_TO_SAVINGS',
            status: 'SUCCESS',
            description: '정기 적금 자동 이체',
          },
        });

        await tx.savingsDetail.update({
          where: {
            walletId: currentSavingsWallet.id,
          },
          data: {
            lastAutoTransferAt: now,
          },
        });

        return 'processed';
      });

      if (result === 'processed') {
        processedCount += 1;
      } else if (result === 'failed') {
        failedCount += 1;
      }
    }

    return {
      processedAt: now,
      processedCount,
      failedCount,
    };
  }
}
