import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class BuyProductDto {
  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(1000)
  qty_of_product: number;
}
