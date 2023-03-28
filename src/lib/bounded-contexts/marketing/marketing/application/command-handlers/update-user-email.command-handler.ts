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
  implements
    Application.ICommandHandler<
      UpdateUserEmailCommand,
      Promise<UpdateUserEmailCommandHandlerResponse>
    >
{
  private ctx: Application.TContext;
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

  @Traceable()
  async execute(
    command: UpdateUserEmailCommand,
  ): Promise<UpdateUserEmailCommandHandlerResponse> {
    this.ctx = command.ctx;
    console.log('UpdateUserEmailCommandHandler');
    const requestUserId = new Domain.UUIDv4(command.userId);
    const userIdEmail = new UserReadModel(
      requestUserId.toString(),
      command.email,
    );

    const updateOrError = await this.userEmailRepo.save(userIdEmail, this.ctx);
    if (updateOrError.isFail()) {
      return fail(updateOrError.value);
    }
    return ok();
  }
}
