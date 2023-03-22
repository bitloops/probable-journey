import { DynamicModule, Global, Inject, Logger, Module } from '@nestjs/common';
import { MongoClient, MongoClientOptions } from 'mongodb';
import { constants } from './mongo.constants';

@Global()
@Module({})
export class MongoModule {
  constructor(
    @Inject(constants.MONGO_DB_CLIENT) private mongoDbClient: MongoClient,
  ) {}
  static forRoot(
    url: string,
    options?: MongoClientOptions | undefined,
  ): DynamicModule {
    return {
      module: MongoModule,
      providers: [
        Logger,
        {
          provide: constants.MONGO_DB_CLIENT,
          useFactory: (): MongoClient => new MongoClient(url, options),
        },
        {
          provide: constants.MONGO_DB_CONNECTION,
          useFactory: async (client: MongoClient) => {
            try {
              // mongodb://localhost:27017
              const connection = await client.connect();
              console.log('*** After connect');
              return connection;
            } catch (error) {
              console.log('*** In error');
              throw error;
            }
          },
          inject: [constants.MONGO_DB_CLIENT],
        },
      ],
      exports: [constants.MONGO_DB_CLIENT, constants.MONGO_DB_CONNECTION],
    };
  }

  async onModuleDestroy() {
    await this.mongoDbClient.close();
  }
}
