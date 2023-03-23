import { Infra, Application } from '@src/bitloops/bl-boilerplate-core';
import { TodoCompletedIntegrationEvent } from '@src/lib/bounded-contexts/todo/todo/contracts/integration-events/todo-completed.integration-event';
import { IncrementTodosCommand } from '../../../commands/Increment-todos.command';

export class TodoCompletedIntegrationEventHandler
  implements Application.IHandleIntegrationEvent
{
  constructor(private commandBus: Infra.CommandBus.IPubSubCommandBus) {}

  get event() {
    return TodoCompletedIntegrationEvent;
  }

  get boundedContext() {
    return 'IAM';
  }

  get version() {
    return TodoCompletedIntegrationEvent.versions[0];
  }

  public async handle(event: TodoCompletedIntegrationEvent): Promise<void> {
    const { data } = event;
    const command = new IncrementTodosCommand({ userId: data.userId });
    await this.commandBus.publish(command);

    console.log(
      `[TodoCompletedIntegrationEvent]: Successfully sent IncrementDepositsCommand`,
    );
  }
}
