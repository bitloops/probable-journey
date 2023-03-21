import { Application } from '@bitloops/bl-boilerplate-core';
import { RegisterCommandDTO } from '../dtos/register-command.dto';
export type TRegisterCommand = {
  password: string;
  email: string;
};
// export class RegisterCommandLegacy extends Application.Command {
//   public readonly password: string;
//   public readonly email: string;
//   public static readonly commandName = 'IAM.REGISTER_USER';
//   constructor(registerCommandDTO: RegisterCommandDTO) {
//     super(RegisterCommandLegacy.commandName, 'IAM');
//     this.password = registerCommandDTO.password;
//     this.email = registerCommandDTO.email;
//   }
//   static getCommandTopic(): string {
//     return super.getCommandTopic(RegisterCommandLegacy.commandName, 'IAM');
//   }
// }
type TRegisterCommandProps = {
  email: string;
  password: string;
};

export class RegisterCommand extends Application.Command {
  public metadata: Application.TCommandMetadata = {
    toContextId: 'IAM',
    createdTimestamp: Date.now(),
  };
  public email: string;
  public password: string;
  constructor(props: TRegisterCommandProps) {
    super();
    this.email = props.email;
    this.password = props.password;
  }
}
