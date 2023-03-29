import {
  Application,
  asyncLocalStorage,
  Domain,
} from '@bitloops/bl-boilerplate-core';
import { UpdateEmailCommandDTO } from '../dtos/update-email-command.dto';
export type TUpdateEmailCommand = {
  userId: string;
  email: string;
};
export class UpdateEmailCommand extends Application.Command {
  public readonly userId: string;
  public readonly email: string;
  public readonly metadata: Application.TCommandMetadata = {
    boundedContextId: 'IAM',
    createdTimestamp: Date.now(),
    messageId: new Domain.UUIDv4().toString(),
    correlationId: asyncLocalStorage.getStore()?.get('correlationId'),
    context: asyncLocalStorage.getStore()?.get('context'),
  };
  constructor(updateEmailCommandDTO: UpdateEmailCommandDTO) {
    super();
    this.userId = updateEmailCommandDTO.userId;
    this.email = updateEmailCommandDTO.email;
  }
}
