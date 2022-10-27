import { Product } from '../models/product';
import { User } from '../models/user';

export const tableProvider = [
  {
    provide: 'PRODUCT_REPOSITORY',
    useValue: Product,
  },
  {
    provide: 'USER_REPOSITORY',
    useValue: User,
  },
];
