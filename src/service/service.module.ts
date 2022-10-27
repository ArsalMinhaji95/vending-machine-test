import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { ProductService } from './product.service';
import { TransactionService } from './transaction.service';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../common/database/database.module';
import { tableProvider } from './table.providers';
import { JwtStrategy } from './stragety/jwt-stragety';
import { ExceptionService } from './exception.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    JwtStrategy,
    UserService,
    ProductService,
    TransactionService,
    AuthService,
    ...tableProvider,
    ExceptionService,
  ],
  exports: [
    UserService,
    ProductService,
    TransactionService,
    AuthService,
    JwtStrategy,
    ExceptionService,
  ],
})
export class ServiceModule {}
