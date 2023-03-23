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
import { UpdateEmailCommand } from '@src/lib/bounded-contexts/iam/authentication/commands/update-email.command';
import { UpdateEmailDTO } from './dto/update-email.dto';
import { RegisterDTO } from './dto/register.dto';
import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream/buses/constants';
import { Application, Infra } from '@src/bitloops/bl-boilerplate-core';
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
    private readonly commandBus: Infra.CommandBus.IPubSubCommandBus,
    @Inject(BUSES_TOKENS.PUBSUB_QUERY_BYS)
    private readonly queryBus: Infra.QueryBus.IQueryBus,
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
    const user = { email: body.email, password: body.password };
    const result = await this.authService.register(user);
    // const command = new RegisterCommand({
    //   email: body.email,
    //   password: hashedPassword,
    // });
    // const results = await this.commandBus.request(command);
    if (result.isOk()) return result.value;
    else {
      switch (result.value.constructor) {
        case Application.Repo.Errors.Conflict:
          throw new HttpException(result.value, HttpStatus.CONFLICT);
        case Application.Repo.Errors.Unexpected:
        default:
          throw new HttpException(
            'Server error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
    // this.domainEventBus.publish(aggregate.domainEvents);
  }
}
