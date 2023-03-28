import {
  Application,
  ok,
  Either,
  Domain,
  fail,
} from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from '../../commands/create-user.command';
import { UserReadModel } from '../../domain/read-models/user-email.read-model';
import {
  UserEmailReadRepoPort,
  UserEmailReadRepoPortToken,
} from '../../ports/user-email-read.repo-port';
import { Traceable } from '@src/bitloops/tracing';

type CreateUserCommandHandlerResponse = Either<
  void,
  Application.Repo.Errors.Unexpected
>;

export class CreateUserCommandHandler
  implements
    Application.ICommandHandler<
      CreateUserCommand,
      Promise<CreateUserCommandHandlerResponse>
    >
{
  private ctx: Application.TContext;
  constructor(
    @Inject(UserEmailReadRepoPortToken)
    private userEmailRepo: UserEmailReadRepoPort,
  ) {}

  get command() {
    return CreateUserCommand;
  }

  get boundedContext(): string {
    return 'Marketing';
  }

  @Traceable()
  async execute(
    command: CreateUserCommand,
  ): Promise<CreateUserCommandHandlerResponse> {
    this.ctx = command.ctx;
    console.log('CreateUserCommandHandler');
    const requestUserId = new Domain.UUIDv4(command.userId);
    const userIdEmail = new UserReadModel(
      requestUserId.toString(),
      command.email,
    );

    const createOrError = await this.userEmailRepo.create(
      userIdEmail,
      this.ctx,
    );
    if (createOrError.isFail()) {
      return fail(createOrError.value);
    }
    return ok();
  }
}
