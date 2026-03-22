import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min, ValidateIf } from 'class-validator';

const SAVINGS_PRODUCT_TYPES = {
  FREE: 'FREE',
  FIXED: 'FIXED',
} as const;

export class CreateSavingsWalletDto {
  @ApiPropertyOptional({
    enum: ['FREE', 'FIXED'],
    description: '적금 상품 유형',
    example: 'FREE',
    default: 'FREE',
  })
  @IsOptional()
  @IsEnum(SAVINGS_PRODUCT_TYPES)
  productType?: 'FREE' | 'FIXED';

  @ApiPropertyOptional({
    description: '정기 적금일 때 매일 자동 이체할 금액',
    example: 10000,
  })
  @ValidateIf((dto: CreateSavingsWalletDto) => dto.productType === 'FIXED')
  @IsInt()
  @Min(1)
  autoTransferAmount?: number;
}
