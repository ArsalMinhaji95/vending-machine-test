import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { TransactionController } from './transaction/transaction.controller';

@Module({
  imports: [],
  controllers: [AppController, UserController, ProductController, TransactionController],
  providers: [AppService, UserService, ProductService],
})
export class AppModule {}
