import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InvalidPasswordException } from '../common/exceptions/invalid-password.exception';
import { ExceptionMessages } from '../common/constants/exception-messages';

@Injectable()
export class AuthService {
  constructor() {}

  async validatePassword(password: string, hash: string): Promise<boolean> {
    const isPasswordCorrect = await bcrypt.compare(password, hash);
    if (isPasswordCorrect) return isPasswordCorrect;
    else throw new InvalidPasswordException(ExceptionMessages.INVALID_PASSWORD);
  }

  async convertPasswordIntoHash(
    password: string,
    saltRounds: number,
  ): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }
}
