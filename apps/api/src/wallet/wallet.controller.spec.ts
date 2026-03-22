import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: {
    depositToMainWallet: jest.Mock;
    transferMainToSavings: jest.Mock;
    transferToUserMainWallet: jest.Mock;
    createSavingsWallet: jest.Mock;
    getUserWallets: jest.Mock;
  };

  beforeEach(async () => {
    walletService = {
      depositToMainWallet: jest.fn(),
      transferMainToSavings: jest.fn(),
      transferToUserMainWallet: jest.fn(),
      createSavingsWallet: jest.fn(),
      getUserWallets: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: walletService,
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  it('transfers money to another user main wallet', async () => {
    walletService.transferToUserMainWallet.mockResolvedValue({
      fromWallet: {
        id: 'wallet-main-1',
        type: 'MAIN',
        balance: 70000n,
      },
      toWallet: {
        id: 'wallet-main-2',
        type: 'MAIN',
        balance: 35000n,
      },
      transaction: {
        id: 'tx-user-transfer-1',
      },
    });

    await expect(
      controller.transferToUser(
        {
          user: {
            id: 'user-1',
          },
        } as any,
        { toEmail: 'friend@example.com', amount: 30000 },
      ),
    ).resolves.toEqual({
      fromWallet: {
        id: 'wallet-main-1',
        type: 'MAIN',
        balance: 70000n,
      },
      toWallet: {
        id: 'wallet-main-2',
        type: 'MAIN',
        balance: 35000n,
      },
      transaction: {
        id: 'tx-user-transfer-1',
      },
    });
  });

  it('deposits to the authenticated user main wallet', async () => {
    walletService.depositToMainWallet.mockResolvedValue({
      wallet: {
        id: 'wallet-main',
        type: 'MAIN',
        balance: 50000n,
      },
      transaction: {
        id: 'tx-1',
      },
      remainingDailyLimit: 2_950_000n,
    });

    await expect(
      controller.depositToMainWallet(
        {
          user: {
            id: 'user-1',
          },
        } as any,
        { amount: 50000 },
      ),
    ).resolves.toEqual({
      wallet: {
        id: 'wallet-main',
        type: 'MAIN',
        balance: 50000n,
      },
      transaction: {
        id: 'tx-1',
      },
      remainingDailyLimit: 2_950_000n,
    });
  });

  it('transfers money from the main wallet to savings', async () => {
    walletService.transferMainToSavings.mockResolvedValue({
      mainWallet: {
        id: 'wallet-main',
        type: 'MAIN',
        balance: 70000n,
      },
      savingsWallet: {
        id: 'wallet-savings',
        type: 'SAVINGS',
        balance: 35000n,
      },
      transaction: {
        id: 'tx-transfer-1',
      },
    });

    await expect(
      controller.transferToSavings(
        {
          user: {
            id: 'user-1',
          },
        } as any,
        { amount: 30000 },
      ),
    ).resolves.toEqual({
      mainWallet: {
        id: 'wallet-main',
        type: 'MAIN',
        balance: 70000n,
      },
      savingsWallet: {
        id: 'wallet-savings',
        type: 'SAVINGS',
        balance: 35000n,
      },
      transaction: {
        id: 'tx-transfer-1',
      },
    });
  });

  it('creates a savings wallet for the authenticated user', async () => {
    walletService.createSavingsWallet.mockResolvedValue({
      id: 'wallet-savings',
      type: 'SAVINGS',
      savingsDetail: {
        productType: 'FREE',
        annualInterestRate: '0.0300',
        autoTransferAmount: null,
      },
    });

    await expect(
      controller.createSavingsWallet({
        user: {
          id: 'user-1',
        },
      } as any, {}),
    ).resolves.toEqual({
      wallet: {
        id: 'wallet-savings',
        type: 'SAVINGS',
        savingsDetail: {
          productType: 'FREE',
          annualInterestRate: '0.0300',
          autoTransferAmount: null,
        },
      },
    });
  });

  it('returns the authenticated user wallets', async () => {
    walletService.getUserWallets.mockResolvedValue({
      mainWallet: {
        id: 'wallet-main',
        type: 'MAIN',
      },
      savingsWallet: null,
    });

    await expect(
      controller.getMyWallets({
        user: {
          id: 'user-1',
        },
      } as any),
    ).resolves.toEqual({
      mainWallet: {
        id: 'wallet-main',
        type: 'MAIN',
      },
      savingsWallet: null,
    });
  });
});
