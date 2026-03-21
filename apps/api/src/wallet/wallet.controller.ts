import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import { DepositMainWalletDto } from './dto/deposit-main-wallet.dto';
import { TransferToSavingsDto } from './dto/transfer-to-savings.dto';
import { TransferToUserDto } from './dto/transfer-to-user.dto';
import { WalletService } from './wallet.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@ApiTags('wallets')
@ApiCookieAuth(SESSION_COOKIE_NAME)
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: '메인 계좌 직접 충전' })
  @Post('main/deposit')
  depositToMainWallet(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DepositMainWalletDto,
  ) {
    return this.walletService.depositToMainWallet(req.user.id, dto.amount);
  }

  @ApiOperation({ summary: '메인 계좌에서 적금 계좌로 이체' })
  @Post('savings/transfer')
  transferToSavings(
    @Req() req: AuthenticatedRequest,
    @Body() dto: TransferToSavingsDto,
  ) {
    return this.walletService.transferMainToSavings(req.user.id, dto.amount);
  }

  @ApiOperation({ summary: '다른 사용자 메인 계좌로 송금' })
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

  @ApiOperation({ summary: '적금 계좌 생성' })
  @Post('savings')
  async createSavingsWallet(@Req() req: AuthenticatedRequest) {
    const wallet = await this.walletService.createSavingsWallet(req.user.id);

    return { wallet };
  }

  @ApiOperation({ summary: '내 메인/적금 계좌 조회' })
  @Get('me')
  getMyWallets(@Req() req: AuthenticatedRequest) {
    return this.walletService.getUserWallets(req.user.id);
  }
}
