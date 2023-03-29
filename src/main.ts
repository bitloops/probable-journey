import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { GrpcOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { ApiModule } from './api/api.module';
import config from './config/configuration';
import { AsyncLocalStorageInterceptor } from './bitloops/nest-auth-passport/jwt/async-local-storage.interceptor';

// gRPC microservice configuration
const grpcMicroserviceOptions: () => GrpcOptions = () => {
  const grpcConfig = config().grpc;
  console.log('grpcConfig', grpcConfig);

  return {
    transport: Transport.GRPC,
    options: {
      url: `${grpcConfig.ip}:${grpcConfig.port}`,
      package: grpcConfig.packageName,
      protoPath: grpcConfig.protoPath,
    },
  };
};

async function bootstrap() {
  const api = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    new FastifyAdapter({
      logger: true,
    }),
    { abortOnError: false },
  );
  const appConfig = config();
  api.useGlobalInterceptors(new AsyncLocalStorageInterceptor());
  api.useGlobalPipes(new ValidationPipe());
  await api.listen(appConfig.http.port, appConfig.http.ip, () => {
    console.log(
      `HTTP server is listening on ${appConfig.http.ip}:${appConfig.http.port}`,
    );
  });

  // Initialize the gRPC server
  const grpcApp = await NestFactory.createMicroservice(
    ApiModule,
    grpcMicroserviceOptions(),
  );

  // Start the gRPC server
  grpcApp.listen().then(() => {
    console.log(
      `gRPC server is listening on ${appConfig.grpc.ip}:${appConfig.grpc.port}`,
    );
  });

  await NestFactory.createMicroservice(AppModule);
}
bootstrap();
