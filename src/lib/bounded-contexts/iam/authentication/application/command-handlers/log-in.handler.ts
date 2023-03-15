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
import {
  UserWriteRepoPortToken,
  UserWriteRepoPort,
} from '../../ports/UserWriteRepoPort';
import { ApplicationErrors } from '../errors';

type LogInUseCaseResponse = Either<
  void,
  ApplicationErrors.UserNotFoundApplicationError
>;

@CommandHandler(LogInCommand)
export class LogInHandler
  implements Application.IUseCase<LogInCommand, Promise<LogInUseCaseResponse>>
{
  constructor(
    @Inject(UserWriteRepoPortToken)
    private readonly userRepo: UserWriteRepoPort, // @Inject(IAMWriteRepoPortToken) private readonly authService: AuthService,
  ) {}

  async execute(command: LogInCommand): Promise<LogInUseCaseResponse> {
    console.log('Login command');
    const userId = new Domain.UUIDv4(command.userId);

    const user = await this.userRepo.getById(userId);

    if (!user) {
      return fail(
        new ApplicationErrors.UserNotFoundApplicationError(command.userId),
      );
    }

    const loginOrError = user.login();
    if (loginOrError.isFail()) {
      return fail(loginOrError.value);
    }

    await this.userRepo.update(user);
    return ok();
  }
}
