import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import { TransactionService } from './transaction.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@ApiTags('transactions')
@ApiCookieAuth(SESSION_COOKIE_NAME)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({ summary: '내 거래내역 조회' })
  @Get('me')
  getMyTransactions(@Req() req: AuthenticatedRequest) {
    return this.transactionService.getMyTransactions(req.user.id);
  }
}
