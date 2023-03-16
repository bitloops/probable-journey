import {
  Application,
  Either,
  fail,
  ok,
  Domain,
} from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from '../../commands/register.command';
import { EmailVO } from '../../domain/EmailVO';
import { UserEntity } from '../../domain/UserEntity';
import {
  UserWriteRepoPortToken,
  UserWriteRepoPort,
} from '../../ports/UserWriteRepoPort';
import { ApplicationErrors } from '../errors';

type RegisterResponse = Either<
  void,
  ApplicationErrors.UserNotFoundApplicationError
>;

@CommandHandler(RegisterCommand)
export class RegisterHandler
  implements
    Application.ICommandHandler<RegisterCommand, Promise<RegisterResponse>>
{
  constructor(
    @Inject(UserWriteRepoPortToken)
    private readonly userRepo: UserWriteRepoPort,
  ) {}

  get command() {
    return RegisterCommand;
  }

  get boundedContext() {
    return 'IAM';
  }

  async execute(command: RegisterCommand): Promise<RegisterResponse> {
    console.log('Register command');
    const email = EmailVO.create({ email: command.email });
    if (email.isFail()) {
      return fail(email.value);
    }

    const user = UserEntity.create({
      email: email.value,
      password: command.password,
    });

    if (user.isFail()) {
      return fail(user.value);
    }

    await this.userRepo.save(user.value);
    return ok();
  }
}
