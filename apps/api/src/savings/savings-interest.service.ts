import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getKstDayRange } from '../common/utils/date-range.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavingsInterestService {
  constructor(private readonly prisma: PrismaService) {}

  async applyDailyInterest(now = new Date()) {
    const { start, end } = getKstDayRange(now);

    const savingsWallets = await this.prisma.wallet.findMany({
      where: {
        type: 'SAVINGS',
        savingsDetail: {
          is: {},
        },
      },
      select: {
        id: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    let processedCount = 0;

    for (const savingsWallet of savingsWallets) {
      const processed = await this.prisma.$transaction(async (tx) => {
        const currentSavingsWallet = await tx.wallet.findUnique({
          where: { id: savingsWallet.id },
          select: {
            id: true,
            balance: true,
            user: {
              select: {
                name: true,
              },
            },
            savingsDetail: {
              select: {
                walletId: true,
                annualInterestRate: true,
                lastInterestAppliedAt: true,
              },
            },
          },
        });

        if (!currentSavingsWallet?.savingsDetail) {
          return false;
        }

        const { lastInterestAppliedAt, annualInterestRate } =
          currentSavingsWallet.savingsDetail;

        if (
          lastInterestAppliedAt &&
          lastInterestAppliedAt >= start &&
          lastInterestAppliedAt < end
        ) {
          return false;
        }

        const dailyInterestAmount = BigInt(
          new Prisma.Decimal(currentSavingsWallet.balance.toString())
            .mul(annualInterestRate.toString())
            .div(365)
            .floor()
            .toString(),
        );

        if (dailyInterestAmount > 0n) {
          await tx.wallet.update({
            where: { id: currentSavingsWallet.id },
            data: {
              balance: {
                increment: dailyInterestAmount,
              },
            },
          });

          await tx.transaction.create({
            data: {
              fromWalletId: null,
              toWalletId: currentSavingsWallet.id,
              fromUserNameSnapshot: null,
              toUserNameSnapshot: currentSavingsWallet.user.name,
              amount: dailyInterestAmount,
              type: 'SAVINGS_INTEREST',
              status: 'SUCCESS',
              description: '적금 이자 지급',
            },
          });
        }

        await tx.savingsDetail.update({
          where: {
            walletId: currentSavingsWallet.id,
          },
          data: {
            lastInterestAppliedAt: now,
          },
        });

        return true;
      });

      if (processed) {
        processedCount += 1;
      }
    }

    return {
      processedAt: now,
      processedCount,
    };
  }
}
