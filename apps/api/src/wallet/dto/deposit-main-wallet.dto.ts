import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class DepositMainWalletDto {
  @ApiProperty({
    example: '50000',
    description: '메인 계좌에 충전할 금액',
  })
  @IsString()
  @Matches(/^\d+$/, { message: '금액은 0 이상의 정수여야 합니다.' })
  amount!: string;
}
