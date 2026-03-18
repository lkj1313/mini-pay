import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TransactionService } from './transaction.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('me')
  getMyTransactions(@Req() req: AuthenticatedRequest) {
    return this.transactionService.getMyTransactions(req.user.id);
  }
}
