import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StreamingCommandHandlers } from './application/command-handlers';
import { EventHandlers } from './application/event-handlers';
// import { QueryHandlers } from './application/query-handlers';

@Module({})
export class MarketingModule {
  static register(options: { inject: Provider<any>[]; imports: any[] }) {
    const InjectedProviders = options.inject || [];
    return {
      module: MarketingModule,
      imports: [CqrsModule, ...options.imports],
      providers: [
        ...StreamingCommandHandlers,
        ...EventHandlers,
        // ...QueryHandlers,
        ...InjectedProviders,
      ],
      exports: [
        ...StreamingCommandHandlers,
        ...EventHandlers /*...QueryHandlers*/,
      ],
    };
  }
}
