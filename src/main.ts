import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
// import { CustomStrategy } from '@nestjs/microservices';
// import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

import { AppModule } from './app.module';

async function bootstrap() {
  // const options: CustomStrategy = {
  //   strategy: new NatsJetStreamServer({
  //     connectionOptions: {
  //       servers: 'localhost:4222',
  //       name: 'messages-listener',
  //     },
  //     consumerOptions: {
  //       deliverGroup: 'messages-group',
  //       durable: 'messages-durable',
  //       deliverTo: 'messages',
  //       manualAck: true,
  //     },
  //     streamConfig: {
  //       name: 'mystream',
  //       subjects: ['*'],
  //     },
  //   }),
  // };

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, {
    abortOnError: false,
  });
  // const microService = app.connectMicroservice(options);
  // microService.listen();
  await app.listen(3000);
}
bootstrap();
