import { Infra, ok } from '@src/bitloops/bl-boilerplate-core';
import { SendEmailCommand } from '../../../commands/send-email.command';

export class MockStreamingCommandBus {
  public readonly mockPublish: jest.Mock;
  private mockStreamingCommandBus: Infra.CommandBus.IStreamCommandBus;

  constructor() {
    this.mockPublish = this.getMockPublishMethod();
    this.mockStreamingCommandBus = {
      publish: this.mockPublish,
      subscribe: jest.fn(),
    };
  }

  getMockStreamingCommandBus(): Infra.CommandBus.IStreamCommandBus {
    return this.mockStreamingCommandBus;
  }

  private getMockPublishMethod(): jest.Mock {
    return jest.fn((command: SendEmailCommand) => {
      console.log('Publishing...', command);
      return Promise.resolve(ok());
    });
  }
}
