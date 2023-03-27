import {
  Application,
  Either,
  fail,
  ok,
  Domain,
} from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { UpdateEmailCommand } from '../../commands/update-email.command';
import { EmailVO } from '../../domain/EmailVO';
import {
  UserWriteRepoPortToken,
  UserWriteRepoPort,
} from '../../ports/UserWriteRepoPort';
import { ApplicationErrors } from '../errors';

type UpdateEmailResponse = Either<
  void,
  ApplicationErrors.UserNotFoundApplicationError
>;

export class UpdateEmailHandler
  implements
    Application.ICommandHandler<
      UpdateEmailCommand,
      Promise<UpdateEmailResponse>
    >
{
  constructor(
    @Inject(UserWriteRepoPortToken)
    private readonly userRepo: UserWriteRepoPort,
  ) {}

  get command() {
    return UpdateEmailCommand;
  }

  get boundedContext() {
    return 'IAM';
  }

  async execute(command: UpdateEmailCommand): Promise<UpdateEmailResponse> {
    console.log('UpdateEmail command');
    const userId = new Domain.UUIDv4(command.userId);
    const email = EmailVO.create({ email: command.email });
    if (email.isFail()) {
      return fail(email.value);
    }

    const userFound = await this.userRepo.getById(userId);

    if (userFound === null) {
      return fail(
        new ApplicationErrors.UserNotFoundApplicationError(command.userId),
      );
    }

    userFound.updateEmail(email.value);

    await this.userRepo.save(userFound);
    return ok();
  }
}
