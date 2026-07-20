import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class TransferToSavingsDto {
  @ApiProperty({
    example: '30000',
    description: '메인 계좌에서 적금 계좌로 보낼 금액',
  })
  @IsString()
  @Matches(/^\d+$/, { message: '금액은 0 이상의 정수여야 합니다.' })
  amount!: string;
}
