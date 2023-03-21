import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
