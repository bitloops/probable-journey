import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '@src/lib/bounded-contexts/iam/authentication/domain/UserEntity';
import {
  UserWriteRepoPort,
  UserWriteRepoPortToken,
} from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UserWriteRepoPortToken)
    private readonly userRepo: UserWriteRepoPort,
  ) {}

  // TODO maybe return primitives and specific fields of UserEntity
  async findOne(email: string): Promise<UserEntity | null> {
    const user = await this.userRepo.getByEmail(email);
    return user;
  }
}
