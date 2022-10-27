import { IsEnum, IsNotEmpty } from 'class-validator';
import { CoinsEnum } from '../../enums/coins';

export class DepositMoneyDto {
  @IsNotEmpty()
  @IsEnum(CoinsEnum)
  deposit: number;
}
