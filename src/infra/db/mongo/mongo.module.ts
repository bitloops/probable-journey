import { Inject, Logger, Module } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

// @Module({
//   providers: [
//     {
//       provide: 'DATABASE_CONNECTION',
//       useFactory: async (): Promise<Db> => {
//         try {
//           const client = await MongoClient.connect('mongodb://127.0.0.1');

//           return client.db('mydb');
//         } catch (e) {
//           throw e;
//         }
//       },
//     },
//   ],
//   exports: ['DATABASE_CONNECTION'],
// })
// export class DatabaseModule {}

@Module({
  providers: [
    {
      provide: 'MONGO_DB_CLIENT',
      useFactory: (): null | MongoClient => null,
    },
    {
      provide: 'MONGO_DB_CONNECTION',
      inject: ['MONGO_DB_CLIENT'],
      useFactory: async (mongoDbClient: null | MongoClient) => {
        try {
          const client = new MongoClient('mongodb://localhost:27017');
          const connection = await client.connect();
          console.log('*** After connect');
          return connection;
        } catch (error) {
          console.log('*** In error');
          throw error;
        }
        // await new Promise((resolve, reject) => {
        //   console.log('*** In factory');
        //   const client = new MongoClient('mongodb://localhost:27017');
        //   client.on('error', (err) => {
        //     console.log('*** In error');
        //     Logger.error(err);
        //     reject(err);
        //   });
        //   client.on('connect', () => {
        //     Logger.log('MongoDB connected');
        //     mongoDbClient = client;
        //     resolve(mongoDbClient);
        //   });
        //   await client.connect();
        //   console.log('*** After connect');
        // }),
      },
    },
  ],
  exports: ['MONGO_DB_CONNECTION', 'MONGO_DB_CLIENT'],
})
export class MongoModule {
  constructor(@Inject('MONGO_DB_CLIENT') private mongoDbClient) {}
  async onModuleDestroy() {
    await this.mongoDbClient.close();
  }
}
