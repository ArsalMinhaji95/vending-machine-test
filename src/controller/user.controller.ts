import {
  Body,
  Controller,
  Delete, Get,
  HttpException,
  HttpStatus,
  Put,
  UseGuards
} from "@nestjs/common";
import { UserService } from '../service/user.service';
import { ConfigService } from '@nestjs/config';
import { ApiResponse } from '../common/interfaces/api-response';
import {
  CustomApplicationFailureMessages,
  CustomApplicationSuccessMessages,
} from '../common/constants/application-messages';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../models/user';
import { AuthGuard } from '@nestjs/passport';
import { ExceptionService } from '../service/exception.service';
import { AuthService } from '../service/auth.service';
import { PasswordDto } from '../common/dtos/user/password.dto';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';
import { InvalidPasswordException } from '../common/exceptions/invalid-password.exception';

@Controller('user')
@ApiTags('User')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly exceptionService: ExceptionService,
  ) {}

  @Delete()
  async deleteUser(@CurrentUser() user: User): Promise<ApiResponse<null>> {
    try {
      await this.userService.deleteUser(user);
      return {
        data: null,
        message: CustomApplicationSuccessMessages.USER_DELETED_SUCCESSFULLY,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  @Get()
  async getUser(@CurrentUser() user: User): Promise<ApiResponse<User>> {
    try {
      return {
        data: user,
        message: CustomApplicationSuccessMessages.USER_SUCCESSFULLY_RETRIEVED,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  @Put()
  async changePassword(
    @CurrentUser() user: User,
    @Body() passwordDTO: PasswordDto,
  ): Promise<ApiResponse<any>> {
    try {
      const updatedUser = await this.userService.getUser(user.username);
      await this.authService.validatePassword(
        passwordDTO.old_password,
        updatedUser.password,
      );
      passwordDTO.new_password = await this.authService.convertPasswordIntoHash(
        passwordDTO.new_password,
        this.configService.get('SALT_ROUNDS') | 10,
      );
      await this.userService.updateUser(updatedUser, passwordDTO.new_password);
      return {
        data: null,
        message: CustomApplicationSuccessMessages.PASSWORD_SUCCESSFULLY_CHANGED,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  handleException(e) {
    this.exceptionService.handleHttpException(this.userException, e);
  }
  private userException = {
    InvalidPasswordException: new HttpException(
      CustomApplicationFailureMessages.INVALID_CREDENTIALS,
      HttpStatus.BAD_REQUEST,
    ),
  };
}
