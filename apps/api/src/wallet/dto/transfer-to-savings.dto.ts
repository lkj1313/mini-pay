import { IsInt, Min } from 'class-validator';

export class TransferToSavingsDto {
  @IsInt()
  @Min(1)
  amount!: number;
}
