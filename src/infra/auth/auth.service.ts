import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '@src/lib/bounded-contexts/iam/authentication/domain/UserEntity';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user: UserEntity | null = await this.usersService.findOne(email);
    if (user) {
      const passwordsMatch = await bcrypt.compare(pass, user.password);
      if (passwordsMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.props.email.email,
      sub: user.props.id.toString(),
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
