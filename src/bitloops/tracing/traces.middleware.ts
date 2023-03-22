import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

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
  console.log(`Request...`);
  // Add correlation id to the request
  req.headers['x-correlation-id'] ||= '123';
  next();
}
