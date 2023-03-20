import { Application } from '@bitloops/bl-boilerplate-core';
import { RegisterCommandDTO } from '../dtos/register-command.dto';
export type TRegisterCommand = {
  password: string;
  email: string;
};
export class RegisterCommandLegacy extends Application.Command {
  public readonly password: string;
  public readonly email: string;
  public static readonly commandName = 'IAM.REGISTER_USER';
  constructor(registerCommandDTO: RegisterCommandDTO) {
    super(RegisterCommandLegacy.commandName, 'IAM');
    this.password = registerCommandDTO.password;
    this.email = registerCommandDTO.email;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(RegisterCommandLegacy.commandName, 'IAM');
  }
}

export class RegisterCommand {
  public readonly boundedContext = 'IAM';
  public readonly createdAt = Date.now();
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
