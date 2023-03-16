import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LocalAuthGuard } from '@src/bounded-contexts/iam/authentication/local-auth.guard';
import { AuthService } from '@src/bounded-contexts/iam/authentication/auth.service';
import { LogInCommand } from '@src/lib/bounded-contexts/iam/authentication/commands/log-in.command';
import { JwtAuthGuard } from '@src/bounded-contexts/iam/authentication/jwt-auth.guard';

import {
  PubSubCommandBus,
  PubSubCommandBusToken,
} from '@src/infra/jetstream/buses/nats-pubsub-command-bus';
import {
  PubSubQueryBus,
  PubSubQueryBusToken,
} from '@src/infra/jetstream/buses/nats-pubsub-query-bus';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(PubSubCommandBusToken)
    private readonly commandBus: PubSubCommandBus, // private readonly queryBus: QueryBus, // @Inject('NATS_JETSTREAM') private readonly nc: any,
    @Inject(PubSubQueryBusToken)
    private readonly queryBus: PubSubQueryBus,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const jwt = this.authService.login(req.user);
    // this.commandBus.execute(
    //         new LogInCommand({ userId: dto.userId }),
    //       );
    return jwt;
  }

  @UseGuards(JwtAuthGuard)
  @Post('login2')
  async login2(@Request() req) {
    console.log('req', req.user);
  }
}
