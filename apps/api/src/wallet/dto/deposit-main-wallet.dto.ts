import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DepositMainWalletDto {
  @ApiProperty({
    example: 50000,
    description: '메인 계좌에 충전할 금액',
  })
  @IsInt()
  @Min(1)
  amount!: number;
}
