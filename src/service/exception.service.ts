import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CustomApplicationFailureMessages } from '../common/constants/application-messages';

@Injectable()
export class ExceptionService {
  private defaultException = new HttpException(
    CustomApplicationFailureMessages.INTERNAL_SERVER_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR,
  );

  handleHttpException(ExceptionObject: any, error: any): HttpException {
    if (error instanceof Error) {
      const exception = ExceptionObject[error.name];
      throw exception instanceof HttpException
        ? exception
        : this.defaultException;
    } else {
      throw this.defaultException;
    }
  }
}
