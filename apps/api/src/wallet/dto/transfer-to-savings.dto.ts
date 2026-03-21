import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class TransferToSavingsDto {
  @ApiProperty({
    example: 30000,
    description: '메인 계좌에서 적금 계좌로 보낼 금액',
  })
  @IsInt()
  @Min(1)
  amount!: number;
}
