import * as util from 'util';
import { asyncLocalStorage } from './traces.middleware';
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

export function Traceable() {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    console.log('Inserted decorators returned function');
    console.log(target, propertyKey, descriptor);
    const originalMethod = descriptor.value;
    if (!isAsyncFunction(originalMethod)) {
      throw new Error(
        'Traceable decorator can only be applied to async methods for now',
      );
    }

    descriptor.value = async function (...args: any[]) {
      console.log('Started executing: ' + propertyKey);

      const correlationId = asyncLocalStorage.getStore();
      console.log(
        'decorator: correlationId',
        correlationId?.get('correlationId'),
      );
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
