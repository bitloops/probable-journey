import { Application, ok, Either, Domain } from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { IncrementTodosCommand } from '../../commands/Increment-todos.command';
import { CompletedTodosVO } from '../../domain/completed-todos.vo';
import { DomainErrors } from '../../domain/errors';
import { UserEntity } from '../../domain/user.entity';
import { UserIdVO } from '../../domain/user-id.vo';
import {
  UserWriteRepoPort,
  UserWriteRepoPortToken,
} from '../../ports/user-write.repo-port';

type IncrementDepositsCommandHandlerResponse = Either<
  void,
  DomainErrors.InvalidTodosCounterError
>;

export class IncrementTodosCommandHandler
  implements
    Application.IUseCase<
      IncrementTodosCommand,
      Promise<IncrementDepositsCommandHandlerResponse>
    >
{
  constructor(
    @Inject(UserWriteRepoPortToken) private userRepo: UserWriteRepoPort,
  ) {}

  get command() {
    return IncrementTodosCommand;
  }

  get boundedContext(): string {
    return 'Marketing';
  }

  async execute(
    command: IncrementTodosCommand,
  ): Promise<IncrementDepositsCommandHandlerResponse> {
    const requestUserId = new Domain.UUIDv4(command.userId);
    const user = await this.userRepo.getById(requestUserId);

    if (!user) {
      // Create account with 0 deposits
      const completedTodosVO = CompletedTodosVO.create({ counter: 0 });
      if (completedTodosVO.isFail()) {
        return fail(completedTodosVO.value);
      }
      const userId = UserIdVO.create({ id: requestUserId });
      const newUserOrError = UserEntity.create({
        completedTodos: completedTodosVO.value,
        userId: userId.value,
      });
      if (newUserOrError.isFail()) {
        return fail(newUserOrError.value);
      }
      const newUser = newUserOrError.value;
      newUser.incrementCompletedTodos();
      await this.userRepo.save(newUser);
      return ok();
    } else {
      user.incrementCompletedTodos();
      await this.userRepo.save(user);
      return ok();
    }
  }
}
