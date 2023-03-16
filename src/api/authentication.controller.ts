import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LocalAuthGuard } from '@src/bounded-contexts/iam/authentication/local-auth.guard';
import { AuthService } from '@src/bounded-contexts/iam/authentication/auth.service';
import { LogInCommand } from '@src/lib/bounded-contexts/iam/authentication/commands/log-in.command';
import { JwtAuthGuard } from '@src/bounded-contexts/iam/authentication/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
