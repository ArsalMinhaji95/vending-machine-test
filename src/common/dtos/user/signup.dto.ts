import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RolesEnum } from '../../enums/roles.enum';

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEnum(RolesEnum)
  role: string;
}
