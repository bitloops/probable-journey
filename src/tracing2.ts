/*tracing.ts*/
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'service-test',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  }),
);

const provider = new NodeTracerProvider({
  resource: resource,
});
const jaegerExporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
});
const processor = new BatchSpanProcessor(jaegerExporter);
provider.addSpanProcessor(processor);

provider.register();
