import { asyncLocalStorage } from '@bitloops/tracing';
import { ContextBuilder } from './context.builder';
export function mockAsyncLocalStorageGet(userId: string, jwt = 'jwt') {
  jest
    .mocked(asyncLocalStorage.getStore()?.get)
    ?.mockImplementation((arg: string) => {
      if (arg === 'correlationId') {
        return 'testing...';
      }
      if (arg === 'context') {
        return new ContextBuilder().withJWT(jwt).withUserId(userId).build();
      }
    });
}
