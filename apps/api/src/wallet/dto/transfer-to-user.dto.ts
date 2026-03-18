import { IsEmail, IsInt, Min } from 'class-validator';

export class TransferToUserDto {
  @IsEmail()
  toEmail!: string;

  @IsInt()
  @Min(1)
  amount!: number;
}
