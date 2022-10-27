import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { LoginDto } from '../common/dtos/user/login.dto';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from '../common/dtos/user/signup.dto';
import { ApiResponse } from '../common/interfaces/api-response';
import {
  CustomApplicationFailureMessages,
  CustomApplicationSuccessMessages,
} from '../common/constants/application-messages';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { ExceptionService } from '../service/exception.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly exceptionService: ExceptionService,
  ) {}

  @Post('signup')
  async signup(@Body() signupInfo: SignupDto): Promise<ApiResponse<string>> {
    try {
      signupInfo.password = await this.authService.convertPasswordIntoHash(
        signupInfo.password,
        this.configService.get('SALT_ROUNDS') | 10,
      );
      await this.userService.signUp(signupInfo);
      return {
        data: null,
        message: CustomApplicationSuccessMessages.USER_SUCCESSFULLY_CREATED,
        statusCode: HttpStatus.OK,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  @Put('login')
  async login(@Body() loginDetail: LoginDto): Promise<ApiResponse<string>> {
    try {
      const user = await this.userService.getUser(loginDetail.username);
      await this.authService.validatePassword(
        loginDetail.password,
        user.password,
      );
      const jwtToken = this.jwtService.sign({ userId: user.id });
      return {
        data: jwtToken,
        message: CustomApplicationSuccessMessages.USER_SUCCESSFULLY_LOGGEDIN,
        statusCode: HttpStatus.OK,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  handleException(e) {
    this.exceptionService.handleHttpException(this.authException, e);
  }
  private authException = {
    SequelizeUniqueConstraintError: new HttpException(
      CustomApplicationFailureMessages.USERNAME_EXIST,
      HttpStatus.GONE,
    ),
    InvalidPasswordException: new HttpException(
      CustomApplicationFailureMessages.INVALID_CREDENTIALS,
      HttpStatus.UNAUTHORIZED,
    ),
    UserNotFoundException: new HttpException(
      CustomApplicationFailureMessages.INVALID_CREDENTIALS,
      HttpStatus.UNAUTHORIZED,
    ),
  };
}
