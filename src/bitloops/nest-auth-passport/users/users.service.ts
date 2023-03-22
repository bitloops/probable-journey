import { Inject, Injectable } from '@nestjs/common';
import {
  UserRepoPort,
  UserRepoPortToken,
} from '@src/bitloops/nest-auth-passport/users/user-repo.port';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UserRepoPortToken)
    private readonly userRepo: UserRepoPort,
  ) {}

  async findOne(email: string): Promise<User | null> {
    const user = await this.userRepo.getByEmail(email);
    return user;
  }
}
