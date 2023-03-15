import { Application, ok, Either, RespondWithPublish, Domain } from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UpdateUserEmailCommand } from '../../commands/update-user-email.command';
import { UserEmailReadModel } from '../../domain/read-models/userEmailReadModel';
import { UserEmailReadRepoPort, UserEmailReadRepoPortToken } from '../../ports/UserEmailReadRepoPort';

type UpdateUserEmailCommandHandlerResponse = Either<
    void,
    never>;

@CommandHandler(UpdateUserEmailCommand)
export class IncrementTodosCommandHandler
    implements
    Application.IUseCase<
        UpdateUserEmailCommand,
        Promise<UpdateUserEmailCommandHandlerResponse>
    >
{
    constructor(@Inject(UserEmailReadRepoPortToken) private userEmailRepo: UserEmailReadRepoPort) { }

    @RespondWithPublish()
    async execute(
        command: UpdateUserEmailCommand,
    ): Promise<UpdateUserEmailCommandHandlerResponse> {
        const requestUserId = new Domain.UUIDv4(command.userId);
        const userIdEmail = new UserEmailReadModel(requestUserId.toString(), command.email);

        await this.userEmailRepo.save(userIdEmail);
        return ok();
    }
}