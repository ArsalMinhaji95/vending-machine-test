import { IsNotEmpty, IsNumber, IsString, Validate } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { CostCustomValidator } from "../../custom-vaildator/cost.custom-validator";

export class UpdateProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'anyproductname' })
  product_name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 3 })
  amount_avb: number;

  @IsNotEmpty()
  @IsNotEmpty()
  @ApiProperty({ example: 5 })
  @Validate(CostCustomValidator)
  cost: number;
}
