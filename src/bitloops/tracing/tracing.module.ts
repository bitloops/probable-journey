import { Global, Module, Type } from '@nestjs/common';
import { AsyncLocalStorageService } from './async-local-storage.service';
import { Infra } from '../bl-boilerplate-core';
import { MESSAGE_BUS_TOKEN } from './constants';

//   }): DynamicModule {
//     const jwtSecretProvider = {
//       provide: JWTSecret,
//       useFactory: async (...args: any[]) => {
//         if (!jwtOptions.useFactory) {
//           throw new Error('No useFactory function provided');
//         }
//         return ((await jwtOptions.useFactory(...args)) as any).secret;
//       },
//       inject: jwtOptions.inject,
//     };
//     const integrationEventBusProvider = {
//       provide: IntegrationEventBusToken,
//       useClass: integrationEventBus,
//     };

@Global()
@Module({})
export class TracingModule {
  static register(params: { messageBus: Type<Infra.EventBus.IEventBus> }) {
    const { messageBus } = params;
    const messageBusProvider = {
      provide: MESSAGE_BUS_TOKEN,
      useClass: messageBus,
    };
    return {
      module: TracingModule,
      providers: [AsyncLocalStorageService, messageBusProvider],
      exports: [AsyncLocalStorageService, messageBusProvider],
    };
  }
}
