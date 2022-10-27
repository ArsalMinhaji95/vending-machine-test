import { ExceptionEnum } from '../enums/exception.enum';

export class UserNotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = ExceptionEnum.UserNotFoundException;
    this.message = message;
  }
}
