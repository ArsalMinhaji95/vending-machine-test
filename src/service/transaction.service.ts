import { Inject, Injectable } from '@nestjs/common';
import { User } from '../models/user';
import { ProductDoestNotExisitException } from '../common/exceptions/product-doest-not-exisit.exception';
import { QunatityOfProductNotAvbException } from '../common/exceptions/qunatity-of-product-not-avb.exception';
import { NotEnoughMoneyException } from '../common/exceptions/not-enough-money.exception';
import { CoinsEnum } from '../common/enums/coins';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('USER_REPOSITORY') private readonly userRepository,
    @Inject('PRODUCT_REPOSITORY') private readonly productRepository,
  ) {}

  async buyProduct(user, productInfo) {
    const product = await this.productRepository.findByPk(
      productInfo.product_id,
    );
    if (!product) {
      throw new ProductDoestNotExisitException(
        'Product doesnt not exist against this id',
      );
    }
    if (product.amount_avb < productInfo.qty_of_product) {
      throw new QunatityOfProductNotAvbException(
        'Product is out of stock or requesting quantity is too much',
      );
    }
    const totalPriceOfItems = productInfo.qty_of_product * product.cost;
    if (user.deposit < totalPriceOfItems) {
      throw new NotEnoughMoneyException('Insufficient balance');
    }
    product.amount_avb = product.amount_avb - productInfo.qty_of_product;
    const remainingChange = await this.convertChangeIntoCoins(
      user.deposit - totalPriceOfItems,
    );

    user.deposit = 0;
    await user.save();
    await product.save();
    return {
      product,
      remainingChange,
      totalPriceOfItems,
    };
  }

  async deposit(user: User, depositMoney: number) {
    return this.userRepository.increment('deposit', {
      by: depositMoney,
      where: { id: user.id },
      returning: true,
      plain: true,
    });
  }
  async resetDeposit(user: User) {
    return this.userRepository.update(
      { deposit: 0 },
      { where: { id: user.id } },
    );
  }
  async convertChangeIntoCoins(remainingChange: number) {
    const coins = Object.keys(CoinsEnum).filter((v) => !isNaN(Number(v)));
    const changeArray = [];
    if (remainingChange != 0 && remainingChange % 5 == 0) {
      for (let i = coins.length - 1; i >= 0; i--) {
        const eachCoin = parseInt(coins[i]);
        while (remainingChange >= eachCoin) {
          remainingChange -= eachCoin;
          changeArray.push(eachCoin);
        }
      }
      return changeArray;
    } else {
      return changeArray;
    }
  }
}
