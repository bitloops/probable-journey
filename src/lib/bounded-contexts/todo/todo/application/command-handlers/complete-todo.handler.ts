import {
  Application,
  Either,
  fail,
  ok,
  Domain,
} from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { CompleteTodoCommand } from '../../commands/complete-todo.command';
import { DomainErrors } from '../../domain/errors';
import { ApplicationErrors } from '../errors';
import {
  TodoWriteRepoPort,
  TodoWriteRepoPortToken,
} from '../../ports/TodoWriteRepoPort';

type CompleteTodoUseCaseResponse = Either<
  void,
  DomainErrors.TodoAlreadyCompletedError | ApplicationErrors.TodoNotFoundError
>;

export class CompleteTodoHandler
  implements
    Application.IUseCase<
      CompleteTodoCommand,
      Promise<CompleteTodoUseCaseResponse>
    >
{
  constructor(
    @Inject(TodoWriteRepoPortToken)
    private readonly todoRepo: TodoWriteRepoPort,
  ) {}

  get command() {
    return CompleteTodoCommand;
  }

  get boundedContext() {
    return 'Todo';
  }

  async execute(
    command: CompleteTodoCommand,
  ): Promise<CompleteTodoUseCaseResponse> {
    console.log('CompleteTodoHandler');

    const todo = await this.todoRepo.getById(new Domain.UUIDv4(command.id));
    if (todo === null) {
      return fail(new ApplicationErrors.TodoNotFoundError(command.id));
    }

    const completedOrError = todo.complete();
    if (completedOrError.isFail()) {
      return fail(completedOrError.value);
    }
    await this.todoRepo.save(todo);

    return ok();
  }
}
