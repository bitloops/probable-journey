import {
  Application,
  ok,
  Either,
  Domain,
  fail,
} from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { IncrementTodosCommand } from '../../commands/Increment-todos.command';
import { CompletedTodosVO } from '../../domain/completed-todos.vo';
import { DomainErrors } from '../../domain/errors';
import { UserEntity } from '../../domain/user.entity';
import {
  UserWriteRepoPort,
  UserWriteRepoPortToken,
} from '../../ports/user-write.repo-port';
import { Traceable } from '@src/bitloops/tracing';

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
  private ctx?: Application.TContext;
  constructor(
    @Inject(UserWriteRepoPortToken) private userRepo: UserWriteRepoPort,
  ) {}

  get command() {
    return IncrementTodosCommand;
  }

  get boundedContext(): string {
    return 'Marketing';
  }

  @Traceable()
  async execute(
    command: IncrementTodosCommand,
  ): Promise<IncrementDepositsCommandHandlerResponse> {
    this.ctx = command.ctx;
    console.log('IncrementTodosCommandHandler');

    const requestUserId = new Domain.UUIDv4(command.id);
    const user = await this.userRepo.getById(requestUserId, this.ctx);
    if (user.isFail()) {
      return fail(user.value);
    }

    if (!user.value) {
      // Create account with 0 deposits
      const completedTodosVO = CompletedTodosVO.create({ counter: 0 });
      if (completedTodosVO.isFail()) {
        return fail(completedTodosVO.value);
      }
      const id = new Domain.UUIDv4(command.id);
      const newUserOrError = UserEntity.create({
        completedTodos: completedTodosVO.value,
        id: id,
      });
      if (newUserOrError.isFail()) {
        return fail(newUserOrError.value);
      }
      const newUser = newUserOrError.value;
      newUser.incrementCompletedTodos();
      const saveResult = await this.userRepo.save(newUser, this.ctx);
      if (saveResult.isFail()) {
        return fail(saveResult.value);
      }
      return ok();
    } else {
      const incrementedOrError = user.value.incrementCompletedTodos();
      if (incrementedOrError.isFail()) {
        return fail(incrementedOrError.value);
      }
      const saveResult = await this.userRepo.save(user.value, this.ctx);
      if (saveResult.isFail()) {
        return fail(saveResult.value);
      }
      return ok();
    }
  }
}
