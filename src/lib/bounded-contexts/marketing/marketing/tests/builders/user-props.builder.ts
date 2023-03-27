import { Domain } from '@src/bitloops/bl-boilerplate-core';
import { UserProps } from '@src/lib/bounded-contexts/marketing/marketing/domain/user.entity';
import { UserIdVO } from '@src/lib/bounded-contexts/marketing/marketing/domain/user-id.vo';
import { CompletedTodosVO } from '@src/lib/bounded-contexts/marketing/marketing/domain/completed-todos.vo';

export class UserPropsBuilder {
  private userId: string;
  private completedTodos: number;
  private id?: string;

  withUserId(userId: string): UserPropsBuilder {
    this.userId = userId;
    return this;
  }

  withCompletedTodos(completedTodos: number): UserPropsBuilder {
    this.completedTodos = completedTodos;
    return this;
  }

  withId(id: string): UserPropsBuilder {
    this.id = id;
    return this;
  }

  build(): UserProps {
    const todoProps: UserProps = {
      userId: UserIdVO.create({ id: new Domain.UUIDv4(this.userId) })
        .value as UserIdVO,
      completedTodos: CompletedTodosVO.create({ counter: this.completedTodos })
        .value as CompletedTodosVO,
    };
    if (this.id) {
      todoProps.id = new Domain.UUIDv4(this.id);
    }
    return todoProps;
  }
}
