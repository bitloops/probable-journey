// Import required modules
import { context, trace, SpanKind, diag } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import {
  getSpanContext,
  setSpanContext,
} from '@opentelemetry/api/build/src/trace/context-utils';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics-base';

const serviceName = 'my-service';
// Events data
const spans = [
  {
    spanId: '4424',
    traceId: '77838',
    serviceName: 'iam',
    spanType: 'Command',
    startTimestamp: 1617709920000,
  },
  {
    spanId: '4424',
    traceId: '77838',
    serviceName: 'iam',
    spanType: 'Command',
    endTimestamp: 1617709921000,
  },
  {
    spanId: '4425',
    traceId: '77838',
    serviceName: 'iam',
    spanType: 'Command Handler',
    startTimestamp: 1617709930000,
  },
  {
    spanId: '4425',
    traceId: '77838',
    serviceName: 'iam',
    spanType: 'Command Handler',
    endTimestamp: 1617709931000,
  },
  {
    spanId: '4426',
    traceId: '77839',
    serviceName: 'marketing',
    spanType: 'Integration Event Handler',
    startTimestamp: 1617709940000,
  },
  {
    spanId: '4426',
    traceId: '77839',
    serviceName: 'marketing',
    spanType: 'Integration Event Handler',
    endTimestamp: 1617709941000,
  },
];

// Group events by spanId and traceId
// const groupedSpans = spans.reduce((acc, event) => {
//   const key = `${event.traceId}-${event.spanId}`;
//   acc[key] = acc[key] || [];
//   acc[key].push(event);
//   return acc;
// }, {});

// const metricsOptions = { port: 9100 };
// const metricsExporter = new PrometheusExporter(metricsOptions, () => {
//   console.log(`scrape http://localhost:${metricsOptions.port}/metrics`);
// });
// // Register the metrics-exporter
// const meter = new MeterProvider({
//   resource: metricsExporter,
//   interval: 1000,
// }).getMeter(serviceName);

// Configure Jaeger exporter
const jaegerExporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
});

const consoleExporter = new ConsoleSpanExporter();

// Initialize tracer provider
const tracerProvider = new BasicTracerProvider();
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter));

// Set global tracer
trace.setGlobalTracerProvider(tracerProvider);

// Get a tracer instance
const tracer = trace.getTracer(serviceName);

// Iterate through the grouped events and create spans
// Object.values(groupedSpans).forEach((eventGroup: any) => {
//   const startEvent = eventGroup.find((event) => event.startTimestamp);

//   const span = tracer.startSpan(startEvent.spanType, {
//     startTime: startEvent.startTimestamp,
//     attributes: {
//       'process.id': startEvent.processId,
//       'trace.id': startEvent.traceId,
//       'span.id': startEvent.spanId,
//       'service.name': startEvent.serviceName,
//       'span.type': startEvent.spanType,
//     },
//   });

//   span.end();
// });

Object.values(spans).forEach((spanData: any) => {
  const spanContext = getSpanContext(context.active());
  // spanContext.traceId = spanData.traceId;
  const traceId: string = spanData.traceId;
  if (spanContext) {
    setSpanContext(context.active(), {
      ...spanContext,
      traceId,
    });
    setSpanContext(context.active(), spanContext);
  }
  const spanCreated = tracer.startSpan(spanData.spanType, {
    startTime: spanData.startTimestamp,
    attributes: {
      'process.id': spanData.processId,
      'trace.id': spanData.traceId,
      'service.name': spanData.serviceName,
      'span.type': spanData.spanType,
    },
    root: true,
  });
  // spanCreated.('traceId', spanData.traceId);

  spanCreated.end();
});

// Force flush and close the exporter to send the spans to Jaeger
tracerProvider
  .getActiveSpanProcessor()
  .forceFlush()
  .then(() => {
    jaegerExporter.shutdown().then(() => {
      console.log('Spans sent to Jaeger');
      process.exit(0);
    });
  });
