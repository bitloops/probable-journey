// TODO fix interface to have I infront of it
import { Injectable } from '@nestjs/common';

// import { Application } from '@src/bitloops/bl-boilerplate-core';
// import { IMessage } from '@src/bitloops/bl-boilerplate-core/domain/messages/IMessage';
// import { UUIDv4 } from '@src/bitloops/bl-boilerplate-core/domain/UUIDv4';

import { Application } from '../../bl-boilerplate-core';
import { IMessage } from '../../bl-boilerplate-core/domain/messages/IMessage';
import { UUIDv4 } from '../../bl-boilerplate-core/domain/UUIDv4';

// TODO use a util without uuid library maybe
// import { PubSubCommandBus } from '../buses/nats-pubsub-command-bus';
import { InProcessMessageBus } from './InProcessMessageBus';

export interface IPubSubCommandBus {
  publish(command: any): Promise<void>;
  request(command: any): Promise<any>;
  pubSubSubscribe(
    subject: string,
    handler: Application.IUseCase<any, any>,
  ): Promise<void>;
}

@Injectable()
export class InProcessPubSubCommandBus implements IPubSubCommandBus {
  // TODO inject the messagebus
  private messageBus: InProcessMessageBus;
  constructor() {
    this.messageBus = new InProcessMessageBus();
  }

  async publish(command: Application.Command): Promise<void> {
    const boundedContext = command.metadata.toContextId;
    const topic = `${boundedContext}.${command.constructor.name}`;
    this.messageBus.publish(topic, command);
  }

  async request(command: Application.Command): Promise<any> {
    const boundedContext = command.metadata.toContextId;
    const topic = `${boundedContext}.${command.constructor.name}`;
    command.metadata.responseTopic = String(new UUIDv4());
    return new Promise(async (resolve, reject) => {
      await this.messageBus.subscribe(
        command.metadata.responseTopic!,
        (message: IMessage) => {
          console.log('sendAndGetResponse: message', message);
          //TODO unsubscribe
          return resolve(message);
        },
      );
      await this.messageBus.publish(topic, command);
    });
  }

  async pubSubSubscribe(
    subject: string,
    handler: Application.ICommandHandler<any, any>,
  ) {
    try {
      //   await this.messageBus.subscribe(subject, handler);
      const subscriberHandlers = this.messageBus.getSubscriberHandlers(subject);
      if (
        subscriberHandlers === undefined ||
        subscriberHandlers === null ||
        subscriberHandlers.length === 0
      ) {
        console.log('going to subscribe', subject);
        await this.messageBus.subscribe(subject, (message) =>
          handler.execute(message),
        );
      }
    } catch (err) {
      console.log('Error in command-bus subscribe:', err);
    }
  }
}

// export class CommandBus implements ICommandBus {
//     // private prefix: string = "command";
//     protected messageBus: IMessageBus;

//     constructor(messageBus: IMessageBus) {
//       this.messageBus = messageBus;
//     }

//     async register<T extends ICommand>(
//       commandTopic: string,
//       registerHandler: RegisterHandler<T>,
//     ): Promise<void> {
//       const subscriberHandlers = this.messageBus.getSubscriberHandlers(commandTopic);
//       if (
//         subscriberHandlers === undefined ||
//         subscriberHandlers === null ||
//         subscriberHandlers.length === 0
//       ) {
//         console.log('going to subscribe', commandTopic);
//         await this.messageBus.subscribe(commandTopic, registerHandler);
//       }
//     }

//     async send(command: ICommand): Promise<void> {
//       return this.messageBus.publish(command.commandTopic, command);
//     }

//     async request<T>(command: ICommand): Promise<T> {
//       // eslint-disable-next-line no-async-promise-executor
//       return new Promise(async (resolve, reject) => {
//         console.log(
//           'sendAndGetResponse: command.metadata.responseTopic',
//           command.metadata?.responseTopic,
//         );
//         if (!command?.metadata?.responseTopic) {
//           return reject('No response topic');
//         }
//         await this.messageBus.subscribe(command.metadata.responseTopic, (message: IMessage) => {
//           console.log('sendAndGetResponse: message', message);
//           //TODO tunsubscribe
//           return resolve(message as T);
//         });
//         console.log('sendAndGetResponse: before publishing command', command.commandTopic);
//         await this.messageBus.publish(command.commandTopic, command);
//       });
//     }

//     async unregister(commandTopic: string): Promise<void> {
//       const subscriberHandlers = this.messageBus.getSubscriberHandlers(commandTopic);
//       console.log({ subscriberHandlers });
//       if (subscriberHandlers) {
//         const [subscriberHandler] = subscriberHandlers;
//         await this.messageBus.unsubscribe(commandTopic, subscriberHandler);
//       }
//     }
//   }

// export class RegisterCommand extends Application.Command {
//   public metadata: Application.TCommandMetadata = {
//     toContextId: 'IAM',
//     createdTimestamp: Date.now(),
//   };
//   public email: string;
//   public password: string;
//   constructor(props: { email: string; password: string }) {
//     super();
//     this.email = props.email;
//     this.password = props.password;
//   }
// }

// const inProcessMessageBus = new InProcessPubSubCommandBus();

// const main = async () => {
//   const command = new RegisterCommand({
//     email: 'a.sar@test.gr',
//     password: 'password',
//   });
//   const response = await inProcessMessageBus.request(command);
//   console.log('response', response);
// };

// main();
