import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../constants/db.constant';
import { ConfigService } from '@nestjs/config';
import { User } from '../../models/user';
import { Product } from '../../models/product';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const config = {
        username: 'postgres',
        password: 'Lenovo1230!',
        database: 'vending_machine',
        host: 'localhost',
        port: '5432',
        dialect: 'postgres',
        urlDatabase: 'localhost',
      };
      const sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        {
          host: config.host,
          dialect: 'postgres',
        },
      );
      sequelize.addModels([User, Product]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
