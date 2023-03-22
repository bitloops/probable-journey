import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Inject,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterCommand } from '@src/lib/bounded-contexts/iam/authentication/commands/register.command';
import { UpdateEmailCommand } from '@src/lib/bounded-contexts/iam/authentication/commands/update-email.command';
import { UpdateEmailDTO } from './dto/update-email.dto';
import { RegisterDTO } from './dto/register.dto';
import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream/buses/constants';
import { PubSubCommandBus } from '@src/bitloops/nest-jetstream/buses/nats-pubsub-command-bus';
import { PubSubQueryBus } from '@src/bitloops/nest-jetstream/buses/nats-pubsub-query-bus';
import { Application } from '@src/bitloops/bl-boilerplate-core';
import { DomainErrors } from '@src/lib/bounded-contexts/iam/authentication/domain/errors';
import {
  AuthService,
  JwtAuthGuard,
  LocalAuthGuard,
} from '@src/bitloops/nest-auth-passport';
import { Traceable } from '@bitloops/tracing';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(BUSES_TOKENS.PUBSUB_COMMAND_BUS)
    private readonly commandBus: PubSubCommandBus, // private readonly queryBus: QueryBus, // @Inject('NATS_JETSTREAM') private readonly nc: any,
    @Inject(BUSES_TOKENS.PUBSUB_QUERY_BYS)
    private readonly queryBus: PubSubQueryBus,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Traceable()
  async login(@Request() req) {
    const jwt = this.authService.login(req.user);
    // this.commandBus.execute(
    //         new LogInCommand({ userId: dto.userId }),
    //       );
    return jwt;
  }

  @UseGuards(JwtAuthGuard)
  @Post('updateEmail')
  async updateEmail(@Request() req, @Body() dto: UpdateEmailDTO) {
    console.log('req', req.user);
    const command = new UpdateEmailCommand({
      email: dto.email,
      userId: req.user.userId,
    });
    const results = await this.commandBus.request(command);
    if (results.isOk) return results.data;
    else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Post('register')
  async register(@Body() body: RegisterDTO) {
    const hashedPassword = await this.hashPassword(body.password);
    const command = new RegisterCommand({
      email: body.email,
      password: hashedPassword,
    });
    const results = await this.commandBus.request(command);
    if (results.isOk) return results.data;
    else {
      switch (results.error.errorId) {
        case Application.Repo.Errors.Conflict.errorId:
          throw new HttpException(results.error.message, HttpStatus.CONFLICT);
        case DomainErrors.InvalidEmailDomainError.errorId:
          throw new HttpException(
            results.error.message,
            HttpStatus.BAD_REQUEST,
          );
        default:
          throw new HttpException(
            'Server error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }

  private hashPassword(password: string) {
    const saltOrRounds = 10;
    return bcrypt.hash(password, saltOrRounds);
  }
}
