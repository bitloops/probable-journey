import {
  Application,
  Either,
  fail,
  ok,
  Domain,
} from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { AddTodoCommand } from '../../commands/add-todo.command';
import { DomainErrors } from '../../domain/errors';
import { TitleVO } from '../../domain/TitleVO';
import { TodoEntity } from '../../domain/TodoEntity';
import {
  TodoWriteRepoPort,
  TodoWriteRepoPortToken,
} from '../../ports/TodoWriteRepoPort';
import { UserIdVO } from '../../domain/UserIdVO';
import { Traceable } from '@src/bitloops/tracing';

type AddTodoUseCaseResponse = Either<
  string,
  DomainErrors.TitleOutOfBoundsError | Application.Repo.Errors.Unexpected
>;

export class AddTodoCommandHandler
  implements Application.ICommandHandler<AddTodoCommand, string>
{
  constructor(
    @Inject(TodoWriteRepoPortToken)
    private readonly todoRepo: TodoWriteRepoPort,
  ) {}

  get command() {
    return AddTodoCommand;
  }

  get boundedContext() {
    return 'Todo';
  }

  @Traceable({
    operation: 'AddTodoCommandHandler',
    metrics: {
      name: 'AddTodoCommandHandler',
      category: 'commandHandler',
    },
  })
  async execute(command: AddTodoCommand): Promise<AddTodoUseCaseResponse> {
    console.log('AddTodoCommand...');

    const title = TitleVO.create({ title: command.title });
    if (title.isFail()) {
      return fail(title.value);
    }

    const userId = UserIdVO.create({
      id: new Domain.UUIDv4(command.metadata.context.userId),
    });
    const todo = TodoEntity.create({
      title: title.value,
      completed: false,
      userId: userId.value,
    });
    if (todo.isFail()) {
      return fail(todo.value);
    }

    const saveResult = await this.todoRepo.save(todo.value);
    if (saveResult.isFail()) {
      return fail(saveResult.value);
    }

    return ok(todo.value.id.toString());
  }
}

// @CommandHandler(AddTodoCommandLegacy)
// export class AddTodoHandlerLegacy
//   implements
//     Application.IUseCase<AddTodoCommandLegacy, Promise<AddTodoUseCaseResponse>>
// {
//   constructor(
//     @Inject(TodoWriteRepoPortToken)
//     private readonly todoRepo: TodoWriteRepoPort,
//   ) {}

//   get command() {
//     return AddTodoCommandLegacy;
//   }

//   get boundedContext() {
//     return 'Todo';
//   }

//   async execute(
//     command: AddTodoCommandLegacy,
//   ): Promise<AddTodoUseCaseResponse> {
//     console.log('AddTodoCommand...');

//     const title = TitleVO.create({ title: command.title });
//     if (title.isFail()) {
//       return fail(title.value);
//     }
//     const userId = UserIdVO.create({ id: new Domain.UUIDv4(command.userId) });
//     const todo = TodoEntity.create({
//       title: title.value,
//       completed: false,
//       userId: userId.value,
//     });
//     if (todo.isFail()) {
//       return fail(todo.value);
//     }

//     await this.todoRepo.save(todo.value);

//     return ok();
//   }
// }
