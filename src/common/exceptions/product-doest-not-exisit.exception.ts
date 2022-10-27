import { ExceptionEnum } from '../enums/exception.enum';

export class ProductDoestNotExisitException extends Error {
  constructor(message) {
    super(message);
    this.name = ExceptionEnum.ProductDoestNotExisitException;
    this.message = message;
  }
}
