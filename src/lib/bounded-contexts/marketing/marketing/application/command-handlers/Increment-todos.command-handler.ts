import { Application, ok, Either, RespondWithPublish, Domain } from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { IncrementTodosCommand } from '../../commands/Increment-todos.command';
import { CompletedTodosVO } from '../../domain/CompletedTodosVO';
import { DomainErrors } from '../../domain/errors';
import { UserEntity } from '../../domain/UserEntity';
import { UserIdVO } from '../../domain/UserIdVO';
import { UserWriteRepoPort, UserWriteRepoPortToken } from '../../ports/UserWriteRepoPort';

type IncrementDepositsCommandHandlerResponse = Either<
  void,
  DomainErrors.InvalidTodosCounterError>;

@CommandHandler(IncrementTodosCommand)
export class IncrementTodosCommandHandler
  implements
  Application.IUseCase<
    IncrementTodosCommand,
    Promise<IncrementDepositsCommandHandlerResponse>
  >
{
  constructor(@Inject(UserWriteRepoPortToken) private userRepo: UserWriteRepoPort) { }

  @RespondWithPublish()
  async execute(
    command: IncrementTodosCommand,
  ): Promise<IncrementDepositsCommandHandlerResponse> {
    const requestUserId = new Domain.UUIDv4(command.userId);
    const user = await this.userRepo.getById(requestUserId);

    if (!user) {
      // Create account with 0 deposits
      const counterVO = CompletedTodosVO.create({ counter: 0 });
      if (counterVO.isFail()) {
        return fail(counterVO.value);
      }
      const userId = UserIdVO.create({ id: requestUserId });
      const newUserOrError = UserEntity.create({ completedTodos: counterVO.value, userId: userId.value });
      if (newUserOrError.isFail()) {
        return fail(newUserOrError.value);
      }
      const newUser = newUserOrError.value;
      newUser.incrementCompletedTodos();
      await this.userRepo.save(newUser);
      return ok();
    }
    user.incrementCompletedTodos();
    await this.userRepo.update(user);
    return ok();
  }
}
