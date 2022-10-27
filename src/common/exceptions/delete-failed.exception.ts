import { ExceptionEnum } from '../enums/exception.enum';

export class DeleteFailedException extends Error {
  constructor(message) {
    super(message);
    this.name = ExceptionEnum.DeleteFailedException;
    this.message = message;
  }
}
