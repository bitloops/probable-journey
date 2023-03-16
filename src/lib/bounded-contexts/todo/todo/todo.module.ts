import { Module, Provider } from '@nestjs/common';
import { PubSubCommandHandlers } from './application/command-handlers';
import { EventHandlers } from './application/event-handlers';
import { PubSubQueryHandlers } from './application/query-handlers';

@Module({
  // imports: [
  //   CqrsModule,
  //   MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
  // ],
  // // controllers: [TodoController],
  // providers: [
  //   ...CommandHandlers,
  //   ...EventHandlers,
  //   ...QueryHandlers,
  //   {
  //     provide: TodoWriteRepoPortToken,
  //     useClass: TodoWriteRepository,
  //   },
  //   {
  //     provide: TodoReadRepoPortToken,
  //     useClass: TodoReadRepository,
  //   },
  // ],
  // exports: [...CommandHandlers, ...EventHandlers, ...QueryHandlers],
})
export class TodoModule {
  static register(options: { inject: Provider<any>[]; imports: any[] }) {
    const InjectedProviders = options.inject || [];
    return {
      module: TodoModule,
      imports: [
        // MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
        ...options.imports,
      ],
      // controllers: [TodoController],
      providers: [
        ...PubSubCommandHandlers,
        ...EventHandlers,
        ...PubSubQueryHandlers,
        ...InjectedProviders,
      ],
      exports: [
        ...PubSubCommandHandlers,
        ...EventHandlers,
        ...PubSubQueryHandlers,
      ],
    };
  }
}
