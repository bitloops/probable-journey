import {
  // ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

const jaegerExporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
});

const traceExporter = jaegerExporter; //new ConsoleSpanExporter();
// const provider = new NodeTracerProvider();
// provider.register();

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: `bitloops-todo-app`, // update this to a more relevant name for you!
  }),
  spanProcessor: new SimpleSpanProcessor(traceExporter),
  instrumentations: [
    new HttpInstrumentation(),
    new FastifyInstrumentation(),
    new NestInstrumentation(),
    new MongoDBInstrumentation({
      enhancedDatabaseReporting: true,
    }),
  ],
});

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
