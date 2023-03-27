import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:14268/api/traces',
});

//TODO replace with OTLP exporter
const jaegerExporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
});

const prometheusExporter = new PrometheusExporter({ preventServerStart: true });

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: `bitloops-todo-app`,
    // ["SemanticResourceAttributes.SERVICE_NAME"]: `bitloops-todo-app`,
    // update this to a more relevant name for you!
  }),
  // spanProcessor: new SimpleSpanProcessor(traceExporter),
  traceExporter: jaegerExporter,
  metricReader: prometheusExporter,
  // instrumentations: [getNodeAutoInstrumentations()],
  instrumentations: [
    new HttpInstrumentation(),
    new FastifyInstrumentation(),
    new MongoDBInstrumentation({
      enhancedDatabaseReporting: true,
    }),
  ],
});

otelSDK.start();

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