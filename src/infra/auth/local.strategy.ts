import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDTO } from '@src/api/dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    await this.validateEmailAndPassword(email, password);
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  private async validateEmailAndPassword(email: string, password: string) {
    const login = new LoginDTO();
    const errors: any = [];
    const dto = { email, password };
    Object.keys(dto).forEach((key) => {
      login[key] = dto[key];
    });

    try {
      await validateOrReject(login);
    } catch (errs: any) {
      errs.forEach((err) => {
        Object.values(err.constraints).forEach((constraint) =>
          errors.push(constraint),
        );
      });
    }

    if (errors.length) {
      throw new BadRequestException(errors);
    }
  }
}
