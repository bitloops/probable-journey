import {
  Application,
  ok,
  Either,
  Domain,
  fail,
} from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { UpdateUserEmailCommand } from '../../commands/update-user-email.command';
import { UserReadModel } from '../../domain/read-models/user-email.read-model';
import {
  UserEmailReadRepoPort,
  UserEmailReadRepoPortToken,
} from '../../ports/user-email-read.repo-port';
import { Traceable } from '@src/bitloops/tracing';

type UpdateUserEmailCommandHandlerResponse = Either<
  void,
  Application.Repo.Errors.Unexpected
>;

export class UpdateUserEmailCommandHandler
  implements Application.ICommandHandler<UpdateUserEmailCommand, void>
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

  @Traceable({
    operation: 'UpdateUserEmailCommandHandler',
    metrics: {
      name: 'UpdateUserEmailCommandHandler',
      category: 'commandHandler',
    },
  })
  async execute(
    command: UpdateUserEmailCommand,
  ): Promise<UpdateUserEmailCommandHandlerResponse> {
    console.log('UpdateUserEmailCommandHandler');
    const requestUserId = new Domain.UUIDv4(command.userId);
    const userIdEmail = new UserReadModel(
      requestUserId.toString(),
      command.email,
    );

    const updateOrError = await this.userEmailRepo.save(userIdEmail);
    if (updateOrError.isFail()) {
      return fail(updateOrError.value);
    }
    return ok();
  }
}
