import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { asyncLocalStorage } from './storage';

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
  const correlationId = req.headers['x-correlation-id'] || randomUUID();
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
