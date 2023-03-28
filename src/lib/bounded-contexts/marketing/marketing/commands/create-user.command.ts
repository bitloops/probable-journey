import { Application } from '@bitloops/bl-boilerplate-core';
export type TCreateUserCommand = {
  email: string;
  userId: string;
};

export class CreateUserCommand extends Application.Command {
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Marketing',
    createdTimestamp: Date.now(),
  };
  public email: string;
  public userId: string;

  constructor(
    props: TCreateUserCommand,
    public readonly ctx: Application.TContext,
  ) {
    super();
    this.email = props.email;
    this.userId = props.userId;
  }
}
