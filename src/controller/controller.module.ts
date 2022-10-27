import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import { ProductController } from './product.controller';
import { TransactionController } from './transaction.controller';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ServiceModule,
    ConfigModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    ProductController,
    TransactionController,
    UserController,
    AuthController,
  ],
  providers: [],
})
export class ControllerModule {}
