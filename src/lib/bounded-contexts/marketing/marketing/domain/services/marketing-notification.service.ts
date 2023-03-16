import { Either, ok } from '@bitloops/bl-boilerplate-core';
import { NotificationTemplateReadRepoPort } from '../../ports/notification-template-read.repo-port.';
import { NotificationTemplateReadModel } from '../read-models/notification-template.read-model';
import { UserEntity } from '../user.entity';


export class MarketingNotificationService {
    constructor(private notificationTemplateRepo: NotificationTemplateReadRepoPort) { }

    public async getNotificationTemplateToBeSent(
        user: UserEntity,
    ): Promise<
        Either<
            { emailOrigin: string; notificationTemplate: NotificationTemplateReadModel | null },
            void
        >
    > {
        const emailOrigin = 'marketing@bitloops.com';
        let notificationTemplate: NotificationTemplateReadModel | null;
        if (user.isFirstTodo()) {
            notificationTemplate = await this.notificationTemplateRepo.getByType('firstTodo');
        } else {
            throw new Error('No notification template found');
        }

        return ok({ emailOrigin: emailOrigin, notificationTemplate });
    }
}
