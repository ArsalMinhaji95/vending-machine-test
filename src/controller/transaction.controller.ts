import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DepositMoneyDto } from '../common/dtos/transactions/deposit-money.dto';
import { TransactionService } from '../service/transaction.service';
import { BuyProductDto } from '../common/dtos/transactions/buy-product.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../models/user';
import { ApiResponse } from '../common/interfaces/api-response';
import {
  CustomApplicationFailureMessages,
  CustomApplicationSuccessMessages,
} from '../common/constants/application-messages';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesEnum } from '../common/enums/roles.enum';
import { RolesGuard } from '../common/guards/role.guard';
import { ExceptionService } from '../service/exception.service';

@Controller('transaction')
@ApiTags('Transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  @Put('deposit')
  @Roles(RolesEnum.BUYER)
  @UseGuards(RolesGuard)
  async addDeposit(
    @CurrentUser() user: User,
    @Body() depositDetail: DepositMoneyDto,
  ): Promise<ApiResponse<Record<any, any>>> {
    try {
      const updatedDeposit = await this.transactionService.deposit(
        user,
        depositDetail.deposit,
      );

      return {
        data: { currentBalance: updatedDeposit[0][0].deposit },
        message: CustomApplicationSuccessMessages.USER_DEPOSIT_SUCCESSFULLY,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  @Put('buy')
  @Roles(RolesEnum.BUYER)
  @UseGuards(RolesGuard)
  async buyProduct(
    @CurrentUser() user,
    @Body() productInfo: BuyProductDto,
  ): Promise<ApiResponse<any>> {
    try {
      const { product, remainingChange, totalPriceOfItems } =
        await this.transactionService.buyProduct(user, productInfo);
      return {
        data: { product, remainingChange, totalPriceOfItems },
        message: CustomApplicationSuccessMessages.PRODUCT_BOUGHT_SUCCESSFULLY,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  @Put('deposit/reset')
  @Roles(RolesEnum.BUYER)
  @UseGuards(RolesGuard)
  async resetDeposit(@CurrentUser() user: User): Promise<ApiResponse<any>> {
    try {
      await this.transactionService.resetDeposit(user);
      return {
        data: null,
        message: CustomApplicationSuccessMessages.USER_DEPOSIT_SUCCESSFULLY,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  handleException(e) {
    this.exceptionService.handleHttpException(this.transactionException, e);
  }
  private transactionException = {
    ProductDoestNotExisitException: new HttpException(
      CustomApplicationFailureMessages.PRODUCT_DOESNT_EXIST,
      HttpStatus.BAD_REQUEST,
    ),
    QunatityOfProductNotAvbException: new HttpException(
      CustomApplicationFailureMessages.QTY_UNAVAILABLE,
      HttpStatus.BAD_REQUEST,
    ),
    NotEnoughMoneyException: new HttpException(
      CustomApplicationFailureMessages.INSUFFICIENT_BALANCE,
      HttpStatus.BAD_REQUEST,
    ),
  };
}
