import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { AsyncLocalStorageService } from './async-local-storage.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(
    private readonly asyncLocalStorageService: AsyncLocalStorageService,
  ) {}

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const asyncLocalStorage = this.asyncLocalStorageService.asyncLocalStorage;

    // req.headers['x-correlation-id'] ||
    const correlationId: string = randomUUID();
    console.log(`Request... ${correlationId}`);
    asyncLocalStorage.run(
      this.asyncLocalStorageService.returnEmptyStore(),
      () => {
        this.asyncLocalStorageService.setCorrelationId(correlationId);
        next();
      },
    );
  }
}

// export function correlationIdFunctionalMiddleware(
//   req: FastifyRequest['raw'],
//   res: FastifyReply['raw'],
//   next: () => void,
// ) {
//   const correlationId = req.headers['x-correlation-id'] || randomUUID();
//   console.log(`Request... ${correlationId}`);
//   const map = new Map();
//   map.set('correlationId', correlationId);
//   asyncLocalStorage.run(map, () => {
//     next();
//   });
//   // // Add correlation id to the request
//   // req.headers['x-correlation-id'] ||= '123';
//   // next();
// }
