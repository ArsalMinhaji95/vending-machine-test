import { Inject, Injectable, Put } from '@nestjs/common';
import { Product } from '../models/product';
import { DeleteFailedException } from '../common/exceptions/delete-failed.exception';
import { Op } from 'sequelize';

@Injectable()
export class ProductService {
  constructor(
    @Inject('PRODUCT_REPOSITORY') private readonly productRepository,
  ) {}
  async getAllProducts(page?): Promise<Product[]> {
    return this.productRepository.findAndCountAll({
      where: {
        amount_avb: {
          [Op.gt]: 0,
        },
      },
      offset: page ? page : 0,
      limit: 10,
    });
  }

  async getAProduct(productId): Promise<Product> {
    return this.productRepository.findByPk(productId, {
      attributes: ['product_name', 'amount_avb', 'cost'],
    });
  }

  async addProduct(seller, productInfo): Promise<Product> {
    const product: Product = {
      ...productInfo,
      seller_id: seller.id,
    };
    return this.productRepository.create(product);
  }

  async removeProduct(seller, productId): Promise<number> {
    const countOfDelete = await this.productRepository.destroy({
      where: { product_id: productId, seller_id: seller.id },
      force: true,
    });
    if (countOfDelete == 0) {
      throw new DeleteFailedException(
        'Product Already Deleted or Invalid Delete',
      );
    }
    return countOfDelete;
  }

  async updateProduct(seller, productId, productInfo): Promise<[number]> {
    const updateProductCount = await this.productRepository.update(
      productInfo,
      {
        where: { seller_id: seller.id, product_id: productId },
      },
    );
    if (updateProductCount[0] == 0) {
      throw new DeleteFailedException(
        'Product Doesnt Exist or you dont have permission to update',
      );
    }
    return updateProductCount;
  }
}
