import * as util from 'util';
// target: the constructor or prototype of the class decorated.
// propertyKey: the name of the key.
// descriptor(ES6): the descriptor of that property.
interface TraceableInput {
  processId: string;
  correlationId: string;
  spanId: string;
  traceId: string;
  parentSpanId: string;
  spanKind: string;
  serviceName: string;
  serviceVersion: string;
  attributes: any;
  links: any;
  events: any;
  status: any;
  startTime: number;
  endTime: number;
  duration: number;
  name: string;
  kind: string;
  spanContext: any;
  resource: any;
  instrumentationLibrary: any;
  isRecording: boolean;
  hasEnded: boolean;
  traceState: any;
  traceFlags: any;
}

export function Traceable() {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    console.log('Inserted decorators returned function');
    console.log(target, propertyKey, descriptor);
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      console.log('Started executing: ' + propertyKey);
      try {
        return originalMethod.apply(this, args);
      } catch (error) {
        return error;
      } finally {
        console.log(`${propertyKey} was executed.`);
      }
    };
  };
}

const isAsyncFunction = (fn: any) => {
  // util.types.isAsyncFunction(fn); // Node 10+
  // Note that the above only reports back what the JavaScript engine is seeing; in particular, the return value may not match the original source code if a transpilation tool was used.
  return fn && fn.constructor && fn.constructor.name === 'AsyncFunction';
};

export function AsyncTraceable() {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    console.log('Inserted decorators returned function');
    console.log(target, propertyKey, descriptor);
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      console.log('Started executing: ' + propertyKey);
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        return error;
      } finally {
        console.log(`${propertyKey} was executed.`);
      }
    };
  };
}
