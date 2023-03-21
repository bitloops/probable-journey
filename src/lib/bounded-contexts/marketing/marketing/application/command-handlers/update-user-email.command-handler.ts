import { Application, ok, Either, Domain } from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { UpdateUserEmailCommand } from '../../commands/update-user-email.command';
import { UserEmailReadModel } from '../../domain/read-models/user-email.read-model';
import {
  UserEmailReadRepoPort,
  UserEmailReadRepoPortToken,
} from '../../ports/user-email-read.repo-port';

type UpdateUserEmailCommandHandlerResponse = Either<void, never>;

export class UpdateUserEmailCommandHandler
  implements
    Application.ICommandHandler<
      UpdateUserEmailCommand,
      Promise<UpdateUserEmailCommandHandlerResponse>
    >
{
  constructor(
    @Inject(UserEmailReadRepoPortToken)
    private userEmailRepo: UserEmailReadRepoPort,
  ) {}

  get command() {
    return UpdateUserEmailCommand;
  }

  get boundedContext(): string {
    return 'Marketing';
  }

  async execute(
    command: UpdateUserEmailCommand,
  ): Promise<UpdateUserEmailCommandHandlerResponse> {
    const requestUserId = new Domain.UUIDv4(command.userId);
    const userIdEmail = new UserEmailReadModel(
      requestUserId.toString(),
      command.email,
    );

    await this.userEmailRepo.save(userIdEmail);
    return ok();
  }
}
