import { Application } from '@bitloops/bl-boilerplate-core';
import { UpdateEmailCommandDTO } from '../dtos/update-email-command.dto';
export type TUpdateEmailCommand = {
  userId: string;
  email: string;
};
export class UpdateEmailCommand extends Application.Command {
  public readonly userId: string;
  public readonly email: string;
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'IAM',
    createdTimestamp: Date.now(),
  };
  constructor(updateEmailCommandDTO: UpdateEmailCommandDTO) {
    super();
    this.userId = updateEmailCommandDTO.userId;
    this.email = updateEmailCommandDTO.email;
  }
}
