import { Inject, Injectable } from '@nestjs/common';
import { EmailVO } from '@src/lib/bounded-contexts/iam/authentication/domain/EmailVO';
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

  async findOne(email: string): Promise<UserEntity | null> {
    const emailVO = EmailVO.create({ email });
    if (emailVO.isFail()) {
      return null;
    }
    const user = await this.userRepo.getByEmail(emailVO.value);
    return user;
  }
}
