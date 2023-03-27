import {
  Application,
  Either,
  fail,
  ok,
  Domain,
} from '@bitloops/bl-boilerplate-core';
import { CommandHandler } from '@nestjs/cqrs';
import { UncompleteTodoCommand } from '../../commands/uncomplete-todo.command';
import { DomainErrors } from '../../domain/errors';
import { Inject } from '@nestjs/common';
import { ApplicationErrors } from '../errors';
import {
  TodoWriteRepoPort,
  TodoWriteRepoPortToken,
} from '../../ports/TodoWriteRepoPort';

type UncompleteTodoUseCaseResponse = Either<
  void,
  DomainErrors.TodoAlreadyUncompletedError | ApplicationErrors.TodoNotFoundError
>;

@CommandHandler(UncompleteTodoCommand)
export class UncompleteTodoHandler
  implements
    Application.IUseCase<
      UncompleteTodoCommand,
      Promise<UncompleteTodoUseCaseResponse>
    >
{
  get command() {
    return UncompleteTodoCommand;
  }

  get boundedContext() {
    return 'Todo';
  }
  constructor(
    @Inject(TodoWriteRepoPortToken)
    private readonly todoRepo: TodoWriteRepoPort,
  ) {}

  async execute(
    command: UncompleteTodoCommand,
  ): Promise<UncompleteTodoUseCaseResponse> {
    console.log('UncompleteTodoHandler');
    const todo = await this.todoRepo.getById(new Domain.UUIDv4(command.id));
    if (todo.isFail()) {
      return fail(todo.value);
    }
    if (todo.value === null) {
      return fail(new ApplicationErrors.TodoNotFoundError(command.id));
    }

    const uncompletedOrError = todo.value.uncomplete();
    if (uncompletedOrError.isFail()) {
      return fail(uncompletedOrError.value);
    }
    const saveResult = await this.todoRepo.save(todo.value);
    if (saveResult.isFail()) {
      return fail(saveResult.value);
    }
    return ok();
  }
}
