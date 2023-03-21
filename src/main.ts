import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { GrpcOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { ApiModule } from './api/api.module';

const HTTP_PORT = 3000;
const HTTP_IP = '0.0.0.0';
const GRPC_PORT = 3001;
const GRPC_IP = '0.0.0.0';
const GRPC_PACKAGE_NAME = 'todo';
const GRPC_PROTO_PATH = 'src/proto/todo.proto';

// gRPC microservice configuration
const grpcMicroserviceOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    url: `${GRPC_IP}:${GRPC_PORT}`,
    package: GRPC_PACKAGE_NAME,
    protoPath: GRPC_PROTO_PATH,
  },
};

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    new FastifyAdapter({
      logger: true,
    }),
    { abortOnError: false },
  );
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(HTTP_PORT, HTTP_IP, () => {
    console.log(`HTTP server is listening on ${HTTP_IP}:${HTTP_PORT}`);
  });

  // Initialize the gRPC server
  const grpcApp = await NestFactory.createMicroservice(
    ApiModule,
    grpcMicroserviceOptions,
  );

  // Start the gRPC server
  grpcApp.listen().then(() => {
    console.log(`gRPC server is listening on ${GRPC_IP}:${GRPC_PORT}`);
  });

  await NestFactory.createMicroservice(AppModule);
}
bootstrap();
