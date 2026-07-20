import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class TransferToUserDto {
  @ApiProperty({
    example: 'friend@example.com',
    description: '송금 받을 사용자 이메일',
  })
  @IsEmail()
  toEmail!: string;

  @ApiProperty({
    example: '20000',
    description: '상대 메인 계좌로 보낼 금액',
  })
  @IsString()
  @Matches(/^\d+$/, { message: '금액은 0 이상의 정수여야 합니다.' })
  amount!: string;
}
