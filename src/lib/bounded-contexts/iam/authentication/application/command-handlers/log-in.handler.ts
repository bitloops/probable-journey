import {
  Application,
  Either,
  fail,
  ok,
  Domain,
} from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { LogInCommand } from '../../commands/log-in.command';

type LogInUseCaseResponse = Either<void, never>;

@CommandHandler(LogInCommand)
export class LogInHandler
  implements
    Application.IUseCase<LogInCommand, Promise<LogInUseCaseResponse>>
{
  constructor(
    // @Inject(IAMWriteRepoPortToken)
    // private readonly userRepo: IAMWriteRepoPort,
    // @Inject(TodoWriteRepoPortToken)
    // private readonly authService: AuthService,
  ) {}

  async execute(command: LogInCommand): Promise<LogInUseCaseResponse> {
    // const user = await this.userRepo.getById(command.email);
    // if does not exist Application error - user does not exist

    // if user exists check if password match
    // if password does not match Application error - wrong password
    
    // const jwt = await this.authService.login(command);

    // update user aggregate last login
    console.log('Login command');
    // await this.userRepo.save(user);
    return ok();
  }
}
