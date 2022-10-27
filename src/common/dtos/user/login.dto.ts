import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'arsal' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'arsal123' })
  password: string;
}
