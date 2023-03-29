import {
  Application,
  Either,
  fail,
  ok,
  Domain,
} from '@bitloops/bl-boilerplate-core';
import { UncompleteTodoCommand } from '../../commands/uncomplete-todo.command';
import { DomainErrors } from '../../domain/errors';
import { Inject } from '@nestjs/common';
import { ApplicationErrors } from '../errors';
import {
  TodoWriteRepoPort,
  TodoWriteRepoPortToken,
} from '../../ports/TodoWriteRepoPort';
import { Traceable } from '@src/bitloops/tracing';

type UncompleteTodoUseCaseResponse = Either<
  void,
  DomainErrors.TodoAlreadyUncompletedError | ApplicationErrors.TodoNotFoundError
>;

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
  private ctx: Application.TContext;
  constructor(
    @Inject(TodoWriteRepoPortToken)
    private readonly todoRepo: TodoWriteRepoPort,
  ) {}

  @Traceable({
    operation: 'UncompleteTodoCommandHandler',
    metrics: {
      name: 'UncompleteTodoCommandHandler',
      category: 'commandHandler',
    },
  })
  async execute(
    command: UncompleteTodoCommand,
  ): Promise<UncompleteTodoUseCaseResponse> {
    this.ctx = command.ctx;
    console.log('UncompleteTodoHandler');
    const todo = await this.todoRepo.getById(
      new Domain.UUIDv4(command.id),
      this.ctx,
    );
    if (todo.isFail()) {
      return fail(todo.value);
    }
    if (!todo.value) {
      return fail(new ApplicationErrors.TodoNotFoundError(command.id));
    }

    const uncompletedOrError = todo.value.uncomplete();
    if (uncompletedOrError.isFail()) {
      return fail(uncompletedOrError.value);
    }
    const saveResult = await this.todoRepo.update(todo.value, this.ctx);
    if (saveResult.isFail()) {
      return fail(saveResult.value);
    }
    return ok();
  }
}
