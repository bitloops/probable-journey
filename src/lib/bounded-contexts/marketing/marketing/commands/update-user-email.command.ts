import { Application } from '@bitloops/bl-boilerplate-core';
export type TUpdateUserEmailCommand = {
  email: string;
  userId: string;
};

export class UpdateUserEmailCommand extends Application.Command {
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Marketing',
    createdTimestamp: Date.now(),
  };
  public email: string;
  public userId: string;

  constructor(
    props: TUpdateUserEmailCommand,
    public readonly ctx?: Application.TContext,
  ) {
    super();
    this.email = props.email;
    this.userId = props.userId;
  }
}
