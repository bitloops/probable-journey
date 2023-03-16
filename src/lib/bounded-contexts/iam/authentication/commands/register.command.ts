import { Application } from '@bitloops/bl-boilerplate-core';
import { RegisterCommandDTO } from '../dtos/register-command.dto';
export type TRegisterCommand = {
    password: string;
    email: string;
};
export class RegisterCommand extends Application.Command {
    public readonly password: string;
    public readonly email: string;
    public static readonly commandName = 'IAM.REGISTER_USER';
    constructor(registerCommandDTO: RegisterCommandDTO) {
        super(RegisterCommand.commandName, 'IAM');
        this.password = registerCommandDTO.password;
        this.email = registerCommandDTO.email;
    }
    static getCommandTopic(): string {
        return super.getCommandTopic(RegisterCommand.commandName, 'IAM');
    }
}
