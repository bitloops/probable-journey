import { Infra, Application } from '@bitloops/bl-boilerplate-core';
import { TodoCompletionsIncrementedDomainEvent } from '../../../domain/events/todo-completions-incremented.event';
import { SendEmailCommand } from '../../../commands/send-email.command';
import { Inject } from '@nestjs/common';
import { UserEmailReadRepoPort, UserEmailReadRepoPortToken } from '../../../ports/UserEmailReadRepoPort';

export class TodoCompletionsIncrementedHandler implements Application.IHandle {
    private commandBus: Infra.CommandBus.ICommandBus;
    constructor(@Inject(UserEmailReadRepoPortToken)
    private readonly emailRepoPort: UserEmailReadRepoPort) {

    }

    public async handle(event: TodoCompletionsIncrementedDomainEvent): Promise<void> {
        const { user } = event;
        const completedTodosCounter = user.completedTodos.counter;
        //TODO domain service?
        if (completedTodosCounter === 1) {
            const userid = user.id;
            const email = await this.emailRepoPort.getUserEmail(userid);

            const command = new SendEmailCommand({
                email
            });
            await this.commandBus.send(command);
        }
    }
}