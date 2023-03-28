import {
  Infra,
  Application,
  Either,
  fail,
  ok,
} from '@bitloops/bl-boilerplate-core';
import { TodoCompletionsIncrementedDomainEvent } from '../../../domain/events/todo-completions-incremented.event';
import { SendEmailCommand } from '../../../commands/send-email.command';
import { Inject } from '@nestjs/common';
import {
  UserEmailReadRepoPort,
  UserEmailReadRepoPortToken,
} from '../../../ports/user-email-read.repo-port';
import {
  NotificationTemplateReadRepoPort,
  NotificationTemplateReadRepoPortToken,
} from '../../../ports/notification-template-read.repo-port.';
import { MarketingNotificationService } from '../../../domain/services/marketing-notification.service';

export class TodoCompletionsIncrementedHandler implements Application.IHandle {
  private commandBus: Infra.CommandBus.IPubSubCommandBus;
  constructor(
    @Inject(UserEmailReadRepoPortToken)
    private readonly emailRepoPort: UserEmailReadRepoPort,
    @Inject(NotificationTemplateReadRepoPortToken)
    private notificationTemplateRepo: NotificationTemplateReadRepoPort,
  ) {}

  get event() {
    return TodoCompletionsIncrementedDomainEvent;
  }

  get boundedContext() {
    return 'Marketing';
  }

  public async handle(
    event: TodoCompletionsIncrementedDomainEvent,
  ): Promise<Either<void, Application.Repo.Errors.Unexpected>> {
    const { data: user, metadata } = event;

    const marketingNotificationService = new MarketingNotificationService(
      this.notificationTemplateRepo,
    );
    const emailToBeSentInfoResponse =
      await marketingNotificationService.getNotificationTemplateToBeSent(user);
    if (emailToBeSentInfoResponse.isFail()) {
      return fail(emailToBeSentInfoResponse.value);
    }

    if (!emailToBeSentInfoResponse.value) {
      return ok();
    }

    const emailToBeSentInfo = emailToBeSentInfoResponse.value;
    const userid = user.id;
    const userEmail = await this.emailRepoPort.getUserEmail(userid);
    if (userEmail.isFail()) {
      // return userEmail.value;
      return ok(); // TODO change this to fail
    }

    if (!userEmail.value) {
      // this.integrationEventBus().publish(new EmailNotFoundErrorMessage(new ApplicationErrors.EmailNotFoundError(userid.toString())));
      // TODO Error bus
      return ok(); // TODO change this to fail
    }

    const command = new SendEmailCommand(
      {
        origin: emailToBeSentInfo.emailOrigin,
        destination: userEmail.value.email,
        content: emailToBeSentInfo.notificationTemplate?.template || '',
      },
      metadata.context,
    );
    await this.commandBus.publish(command);
    return ok();
  }
}
