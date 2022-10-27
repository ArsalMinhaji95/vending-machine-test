import { ExceptionEnum } from '../enums/exception.enum';

export class InvalidPasswordException extends Error {
  constructor(message) {
    super(message);
    this.name = ExceptionEnum.InvalidPasswordException;
    this.message = message;
  }
}
