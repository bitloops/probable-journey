import {
  Application,
  Domain,
  Either,
  fail,
  ok,
} from '@bitloops/bl-boilerplate-core';
import { CommandHandler } from '@nestjs/cqrs';
import { ModifyTodoTitleCommand } from '../../commands/modify-title-todo.command';
import { Inject } from '@nestjs/common';
import { DomainErrors } from '../../domain/errors';
import { TitleVO } from '../../domain/TitleVO';
import {
  TodoWriteRepoPort,
  TodoWriteRepoPortToken,
} from '../../ports/TodoWriteRepoPort';
import { ApplicationErrors } from '../errors';

type ModifyTodoTitleResponse = Either<void, DomainErrors.TitleOutOfBoundsError>;

@CommandHandler(ModifyTodoTitleCommand)
export class ModifyTodoTitleHandler
  implements
    Application.IUseCase<
      ModifyTodoTitleCommand,
      Promise<ModifyTodoTitleResponse>
    >
{
  private ctx: Application.TContext;
  constructor(
    @Inject(TodoWriteRepoPortToken)
    private readonly todoRepo: TodoWriteRepoPort,
  ) {}

  get command() {
    return ModifyTodoTitleCommand;
  }

  get boundedContext() {
    return 'Todo';
  }

  async execute(
    command: ModifyTodoTitleCommand,
  ): Promise<ModifyTodoTitleResponse> {
    this.ctx = command.ctx;
    const requestId = new Domain.UUIDv4(command.id);
    const todoFound = await this.todoRepo.getById(requestId, this.ctx);

    if (!todoFound) {
      return fail(
        new ApplicationErrors.TodoNotFoundError(command.id.toString()),
      );
    }

    const titleToUpdate = TitleVO.create({ title: command.title });
    if (titleToUpdate.isFail()) {
      return fail(titleToUpdate.value);
    }

    todoFound.modifyTitle(titleToUpdate.value);
    await this.todoRepo.update(todoFound, this.ctx);

    return ok();
  }
}
