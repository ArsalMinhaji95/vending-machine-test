import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class PasswordDto {
  @IsNotEmpty()
  @IsString()
  old_password: string;

  @IsNotEmpty()
  @IsString()
  new_password: string;
}
