import { Application, ok, Either, Domain } from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from '../../commands/create-user.command';
import { UserReadModel } from '../../domain/read-models/user-email.read-model';
import {
  UserEmailReadRepoPort,
  UserEmailReadRepoPortToken,
} from '../../ports/user-email-read.repo-port';

type CreateUserCommandHandlerResponse = Either<void, never>;

export class CreateUserCommandHandler
  implements
    Application.ICommandHandler<
      CreateUserCommand,
      Promise<CreateUserCommandHandlerResponse>
    >
{
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

  async execute(
    command: CreateUserCommand,
  ): Promise<CreateUserCommandHandlerResponse> {
    const requestUserId = new Domain.UUIDv4(command.userId);
    const userIdEmail = new UserReadModel(
      requestUserId.toString(),
      command.email,
    );

    await this.userEmailRepo.create(userIdEmail);
    return ok();
  }
}
