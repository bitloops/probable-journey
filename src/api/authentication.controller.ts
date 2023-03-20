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
import { LocalAuthGuard } from '@src/bounded-contexts/iam/authentication/local-auth.guard';
import { AuthService } from '@src/bounded-contexts/iam/authentication/auth.service';
import { LogInCommand } from '@src/lib/bounded-contexts/iam/authentication/commands/log-in.command';
import { JwtAuthGuard } from '@src/bounded-contexts/iam/authentication/jwt-auth.guard';

import { RegisterCommand } from '@src/lib/bounded-contexts/iam/authentication/commands/register.command';
import { UpdateEmailCommand } from '@src/lib/bounded-contexts/iam/authentication/commands/update-email.command';
import { UpdateEmailDTO } from './dto/update-email.dto';
import { RegisterDTO } from './dto/register.dto';
import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream/buses/constants';
import { PubSubCommandBus } from '@src/bitloops/nest-jetstream/buses/nats-pubsub-command-bus';
import { PubSubQueryBus } from '@src/bitloops/nest-jetstream/buses/nats-pubsub-query-bus';

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
    const command = new RegisterCommand(body.email, hashedPassword);
    const results = await this.commandBus.request(command);
    if (results.isOk) return results.data;
    else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  private hashPassword(password: string) {
    const saltOrRounds = 10;
    return bcrypt.hash(password, saltOrRounds);
  }
}
