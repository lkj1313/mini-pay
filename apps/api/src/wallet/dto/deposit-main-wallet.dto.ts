import { IsInt, Min } from 'class-validator';

export class DepositMainWalletDto {
  @IsInt()
  @Min(1)
  amount!: number;
}
