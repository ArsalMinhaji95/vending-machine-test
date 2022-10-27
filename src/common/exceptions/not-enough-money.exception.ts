import { ExceptionEnum } from '../enums/exception.enum';

export class NotEnoughMoneyException extends Error {
  constructor(message) {
    super(message);
    this.name = ExceptionEnum.NotEnoughMoneyException;
    this.message = message;
  }
}
