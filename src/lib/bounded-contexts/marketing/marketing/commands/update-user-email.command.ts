import { Application } from '@bitloops/bl-boilerplate-core';
export type TUpdateUserEmailCommand = {
    email: string;
    userId: string;
};
export class UpdateUserEmailCommand extends Application.Command {
    public readonly email: string;
    public readonly userId: string;
    public static readonly commandName = 'Marketing.SEND_EMAIL';
    constructor(sendEmail: TUpdateUserEmailCommand) {
        super(UpdateUserEmailCommand.commandName, 'Marketing');
        this.email = sendEmail.email;
        this.userId = sendEmail.userId;
    }
    static getCommandTopic(): string {
        return super.getCommandTopic(UpdateUserEmailCommand.commandName, 'Marketing');
    }
}