import { ExceptionEnum } from '../enums/exception.enum';

export class QunatityOfProductNotAvbException extends Error {
  constructor(message) {
    super(message);
    this.name = ExceptionEnum.QunatityOfProductNotAvbException;
    this.message = message;
  }
}
