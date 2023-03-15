import { Either, Domain, ok } from "@src/bitloops/bl-boilerplate-core";
import { CompletedTodosVO } from "./CompletedTodosVO";
import { UserIdVO } from "./UserIdVO";
import { TodoCompletionsIncrementedDomainEvent } from "./events/todo-completions-incremented.event";

export interface UserProps {
    userId: UserIdVO;
    completedTodos: CompletedTodosVO;
}

type TUserEntityPrimitives = {
  userId: string;
  completedTodos: number;
};

export class UserEntity extends Domain.Aggregate<UserProps> {
  private constructor(props: UserProps) {
    super(props, props.userId.id);
  }

  public static create(props: UserProps): Either<UserEntity, never> {
    const user = new UserEntity(props);
    return ok(user);
  }

  get completedTodos(): CompletedTodosVO {
    return this.props.completedTodos;
  }

  get id() {
    return this._id;
  }

  incrementCompletedTodos(): void {
    const incrementedCompletedTodos = this.props.completedTodos.counter + 1;
    const completedTodos = CompletedTodosVO.create({
      counter: incrementedCompletedTodos,
    }).value as CompletedTodosVO;

    this.props.completedTodos = completedTodos;
    this.addDomainEvent(new TodoCompletionsIncrementedDomainEvent(this))
  }

  public static fromPrimitives(data: TUserEntityPrimitives): UserEntity {
    const userEntityProps = {
      userId: UserIdVO.create({ id: new Domain.UUIDv4(data.userId) })
        .value as UserIdVO,
      completedTodos: CompletedTodosVO.create({
        counter: data.completedTodos,
      }).value as CompletedTodosVO,
    };
    return new UserEntity(userEntityProps);
  }

  public toPrimitives(): TUserEntityPrimitives {
    return {
      userId: this.props.userId.id.toString(),
      completedTodos: this.props.completedTodos.counter,
    };
  }
}
