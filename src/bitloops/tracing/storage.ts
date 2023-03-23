import { AsyncLocalStorage } from 'node:async_hooks';

type AsyncLocalStorageKeys = 'correlationId' | 'userContext';

type AsyncLocalStorageStore = Map<AsyncLocalStorageKeys, string>;

export const asyncLocalStorage =
  new AsyncLocalStorage<AsyncLocalStorageStore>();
