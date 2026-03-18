import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { DepositMainWalletDto } from './dto/deposit-main-wallet.dto';
import { TransferToSavingsDto } from './dto/transfer-to-savings.dto';
import { TransferToUserDto } from './dto/transfer-to-user.dto';
import { WalletService } from './wallet.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('main/deposit')
  depositToMainWallet(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DepositMainWalletDto,
  ) {
    return this.walletService.depositToMainWallet(req.user.id, dto.amount);
  }

  @Post('savings/transfer')
  transferToSavings(
    @Req() req: AuthenticatedRequest,
    @Body() dto: TransferToSavingsDto,
  ) {
    return this.walletService.transferMainToSavings(req.user.id, dto.amount);
  }

  @Post('transfer')
  transferToUser(
    @Req() req: AuthenticatedRequest,
    @Body() dto: TransferToUserDto,
  ) {
    return this.walletService.transferToUserMainWallet(
      req.user.id,
      dto.toEmail,
      dto.amount,
    );
  }

  @Post('savings')
  async createSavingsWallet(@Req() req: AuthenticatedRequest) {
    const wallet = await this.walletService.createSavingsWallet(req.user.id);

    return { wallet };
  }

  @Get('me')
  getMyWallets(@Req() req: AuthenticatedRequest) {
    return this.walletService.getUserWallets(req.user.id);
  }
}
