import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from '../service/product.service';
import { CreateProductDto } from '../common/dtos/product/create-product.dto';
import { ApiResponse } from '../common/interfaces/api-response';
import { Product } from '../models/product';
import {
  CustomApplicationFailureMessages,
  CustomApplicationSuccessMessages,
} from '../common/constants/application-messages';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../models/user';
import { UpdateProductDto } from '../common/dtos/product/update-product.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesEnum } from '../common/enums/roles.enum';
import { RolesGuard } from '../common/guards/role.guard';
import { ExceptionService } from '../service/exception.service';
import { ExceptionEnum } from '../common/enums/exception.enum';

@Controller('product')
@ApiTags('Product')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly exceptionService: ExceptionService,
  ) {}

  @Get()
  async getMachineProducts(
    @Query() query: { page: number },
    @CurrentUser() user: User,
  ): Promise<ApiResponse<Product[]>> {
    try {
      const products = await this.productService.getAllProducts(query.page);
      return {
        data: products,
        message:
          CustomApplicationSuccessMessages.MACHINE_PRODUCTS_RETRIVED_SUCCESSFULLY,
        statusCode: HttpStatus.OK,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  @Get(':productId')
  async getSingleProduct(
    @CurrentUser() user: User,
    @Param('productId') prodId,
  ): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productService.getAProduct(parseInt(prodId));
      return {
        data: product,
        message:
          CustomApplicationSuccessMessages.MACHINE_PRODUCTS_RETRIVED_SUCCESSFULLY,
        statusCode: HttpStatus.OK,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  @Post()
  @Roles(RolesEnum.SELLER)
  @UseGuards(RolesGuard)
  async addProductToMachine(
    @CurrentUser() user: User,
    @Body() productInfo: CreateProductDto,
  ): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productService.addProduct(user, productInfo);
      return {
        data: product,
        message: CustomApplicationSuccessMessages.PRODUCT_ADDED_SUCCESSFULLY,
        statusCode: HttpStatus.OK,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  @Delete(':productId')
  @Roles(RolesEnum.SELLER)
  @UseGuards(RolesGuard)
  async removeProductFromMachine(
    @CurrentUser() user: User,
    @Param('productId') prodId,
  ) {
    try {
      await this.productService.removeProduct(user, parseInt(prodId));
      return {
        data: null,
        message: CustomApplicationSuccessMessages.PRODUCT_REMOVE_SUCCESSFULLY,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  @Put(':productId')
  @Roles(RolesEnum.SELLER)
  @UseGuards(RolesGuard)
  async updateProductInfo(
    @CurrentUser() user: User,
    @Body() updateProductDTO: UpdateProductDto,
    @Param('productId') prodId,
  ) {
    try {
      await this.productService.updateProduct(
        user,
        parseInt(prodId),
        updateProductDTO,
      );
      return {
        data: null,
        message:
          CustomApplicationSuccessMessages.PRODUCT_INFO_UPDATED_SUCCESSFULLY,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (e) {
      this.handleException(e);
    }
  }

  handleException(e) {
    this.exceptionService.handleHttpException(this.productException, e);
  }

  private productException = {
    [ExceptionEnum.DeleteFailedException]: new HttpException(
      CustomApplicationFailureMessages.INVALID_PRODUCT,
      HttpStatus.GONE,
    ),
  };
}
