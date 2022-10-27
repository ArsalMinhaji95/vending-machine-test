import { Inject, Injectable } from '@nestjs/common';
import { User } from '../models/user';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';
import { ExceptionMessages } from '../common/constants/exception-messages';

@Injectable()
export class UserService {
  constructor(@Inject('USER_REPOSITORY') private readonly userRepository) {}

  async signUp(signupInfo): Promise<User> {
    return await this.userRepository.create(signupInfo);
  }

  deleteUser(user: User) {
    return this.userRepository.destroy({
      where: { id: user.id },
    });
  }

  updateUser(updateUser, password) {
    return this.userRepository.update(
      { password: password },
      {
        where: { id: updateUser.id },
      },
    );
  }

  async getUser(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username: username },
    });
    if (!user) {
      throw new UserNotFoundException(ExceptionMessages.USER_NOT_FOUND);
    }
    return user;
  }

  async getUserById(userId: number): Promise<User | boolean> {
    const user = await this.userRepository.findByPk(userId, {
      attributes: ['id', 'username', 'deposit', 'role'],
    });
    if (!user) {
      return false;
    }
    return user;
  }
}
