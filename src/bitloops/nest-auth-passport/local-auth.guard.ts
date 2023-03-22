import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginDTO } from '@src/api/dto/login.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const loginDto = plainToClass(LoginDTO, req.body);
    const errors = await validate(loginDto);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
