import { Application } from '@bitloops/bl-boilerplate-core';
import { UpdateEmailCommandDTO } from '../dtos/update-email-command.dto';
export type TUpdateEmailCommand = {
    userId: string;
    email: string;
};
export class UpdateEmailCommand extends Application.Command {
    public readonly userId: string;
    public readonly email: string;
    public static readonly commandName = 'IAM.UPDATE_EMAIL';
    constructor(updateEmailCommandDTO: UpdateEmailCommandDTO) {
        super(UpdateEmailCommand.commandName, 'IAM');
        this.userId = updateEmailCommandDTO.userId;
        this.email = updateEmailCommandDTO.email;
    }
    static getCommandTopic(): string {
        return super.getCommandTopic(UpdateEmailCommand.commandName, 'IAM');
    }
}
