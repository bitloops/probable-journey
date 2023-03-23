import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuid } from 'uuid';

type AsyncLocalStorageKeys = 'correlationId';

type AsyncLocalStorageStore = Map<AsyncLocalStorageKeys, string>;

export const asyncLocalStorage =
  new AsyncLocalStorage<AsyncLocalStorageStore>();

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    console.log('Request...');
    // Add correlation id to the request
    req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || '123';
    next();
  }
}

export function correlationId(
  req: FastifyRequest['raw'],
  res: FastifyReply['raw'],
  next: () => void,
) {
  const correlationId = req.headers['x-correlation-id'] || uuid();
  console.log(`Request... ${correlationId}`);
  const map = new Map();
  map.set('correlationId', correlationId);
  asyncLocalStorage.run(map, () => {
    next();
  });
  // // Add correlation id to the request
  // req.headers['x-correlation-id'] ||= '123';
  // next();
}
