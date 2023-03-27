import { Inject } from '@nestjs/common';
import { AsyncLocalStorageService } from './async-local-storage.service';
import { MESSAGE_BUS_TOKEN } from './constants';
import { Infra } from '../bl-boilerplate-core';
import { isAsyncFunction } from './utils';
import { TraceEvent, TraceableDecoratorInput } from './definitons';

const TRACING_TOPIC = 'tracing';

/**
 *  the traceable decorator accesses the AsyncLocalStorageService
 *  and gets the correlationId from the store.
 * */
export function Traceable(input: TraceableDecoratorInput) {
  const asyncLocalStorageInjector = Inject(AsyncLocalStorageService);
  const messageBusInjector = Inject(MESSAGE_BUS_TOKEN);

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    // For now we only trace async functions
    if (!isAsyncFunction(originalMethod)) {
      throw new Error(
        'Traceable decorator can only be applied to async methods for now',
      );
    }

    const asyncLocalStorageServiceKey = 'asyncLocalStorageService';
    const messageBusServiceKey = 'messageBusService';
    asyncLocalStorageInjector(target, asyncLocalStorageServiceKey);
    messageBusInjector(target, messageBusServiceKey);

    descriptor.value = async function (...args: any[]) {
      console.log(
        `Started executing ... [${this.constructor.name}][${propertyKey}]`,
      );
      const startTime = Date.now();

      const asyncLocalStorage = this[
        asyncLocalStorageServiceKey
      ] as AsyncLocalStorageService;

      const correlationId = asyncLocalStorage.getCorrelationId();
      console.table({
        correlationId,
      });
      // console.log('user context', store?.get('userContext'));
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        throw error;
      } finally {
        const endTime = Date.now();
        const traceEvent: TraceEvent = {
          correlationId,
          operation: input.operation,
          startTime,
          endTime,
        };
        const messageBus = this[
          messageBusServiceKey
        ] as Infra.MessageBus.IMessageBus;
        await messageBus.publish(TRACING_TOPIC, traceEvent);
        console.log(
          `Finished executing ... [${this.constructor.name}][${propertyKey}].`,
        );
      }
    };
  };
}

// export function AddCorrelationId() {
//   return function (target: any) {
//     // Add the metadata to the class instance

//     const correlationId = AsyncLocalStorageService.asyncLocalStorage
//       .getStore()
//       ?.get('correlationId');
//     if (!target.metadata) {
//       target.metadata = {};
//     }
//     target.metadata.correlationId = correlationId;
//   };
// }

export function AddCorrelationId<T extends new (...args: any[]) => {}>(
  constructor: T,
) {
  return class extends constructor {
    metadata: any;

    constructor(...args: any[]) {
      super(...args);

      const correlationId = AsyncLocalStorageService.asyncLocalStorage
        .getStore()
        ?.get('correlationId');
      if (!this.metadata) {
        this.metadata = {};
      }
      this.metadata.correlationId = correlationId;
      Object.setPrototypeOf(this, constructor.prototype);
    }
    // @ts-ignore
    static get name() {
      return constructor.name;
    }
  };
}
