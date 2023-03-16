import { Infra, Application } from "@src/bitloops/bl-boilerplate-core";
// import { UserRegisteredIntegrationEvent } from "@src/lib/bounded-contexts/auth";
import { UpdateUserEmailCommand } from "../../../commands/update-user-email.command";

export class UserRegisteredIntegrationEventHandler implements Application.IHandle {
    private commandBus: Infra.CommandBus.ICommandBus;
    constructor() {
    }

    public async handle(event: UserRegisteredIntegrationEvent): Promise<void> {

        const { data } = event;
        const command = new UpdateUserEmailCommand({ userId: data.userId, email: data.email });
        await this.commandBus.send(command);

        console.log(
            `[UserRegisteredIntegrationEvent]: Successfully sent UpdateUserEmailCommand`,
        );
    }
}