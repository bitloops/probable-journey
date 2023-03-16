import { Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../UserEntity';

export class UserUpdatedEmailDomainEvent extends Domain.Event<UserEntity> {
    public static readonly eventName = UserUpdatedEmailDomainEvent.name;
    public static readonly fromContextId = 'IAM';

    constructor(public readonly user: UserEntity, uuid?: string) {
        const metadata = {
            fromContextId: UserUpdatedEmailDomainEvent.fromContextId,
            id: uuid,
        };
        super(UserUpdatedEmailDomainEvent.getEventTopic(), user, metadata, user.id);
    }

    static getEventTopic() {
        return UserUpdatedEmailDomainEvent.eventName;
    }
}
