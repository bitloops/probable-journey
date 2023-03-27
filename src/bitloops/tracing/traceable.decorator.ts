import { Inject } from '@nestjs/common';
import * as util from 'util';
import { AsyncLocalStorageService } from './async-local-storage.service';
import { MESSAGE_BUS_TOKEN } from './constants';
// import { asyncLocalStorage } from './async-local-storage.service';
// target: the constructor or prototype of the class decorated.
// propertyKey: the name of the key.
// descriptor(ES6): the descriptor of that property.
interface TraceableInput {
  processId: string;
  correlationId: string;
}

// export function Traceable() {
//   return function (
//     target: unknown,
//     propertyKey: string,
//     descriptor: PropertyDescriptor,
//   ) {
//     console.log('Inserted decorators returned function');
//     console.log(target, propertyKey, descriptor);
//     const originalMethod = descriptor.value;
//     descriptor.value = function (...args: any[]) {
//       console.log('Started executing: ' + propertyKey);
//       const correlationId = asyncLocalStorage.getStore();
//       console.log(
//         'decorator: correlationId',
//         correlationId?.get('correlationId'),
//       );
//       try {
//         return originalMethod.apply(this, args);
//       } catch (error) {
//         return error;
//       } finally {
//         console.log(`${propertyKey} was executed.`);
//       }
//     };
//   };
// }

const isAsyncFunction = (fn: any) => {
  // util.types.isAsyncFunction(fn); // Node 10+
  // Note that the above only reports back what the JavaScript engine is seeing; in particular, the return value may not match the original source code if a transpilation tool was used.
  return fn && fn.constructor && fn.constructor.name === 'AsyncFunction';
};

/**
 *  the traceable decorator accesses the AsyncLocalStorageService
 *  and gets the correlationId from the store.
 * */
export function Traceable() {
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

      const asyncLocalStorage: AsyncLocalStorageService = this[
        asyncLocalStorageServiceKey
      ] as AsyncLocalStorageService;

      const store = asyncLocalStorage.getAsyncLocalStore();
      const correlationId = store?.get('correlationId');
      console.table({
        correlationId,
      });
      console.log('user context', store?.get('userContext'));
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        return error;
      } finally {
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
