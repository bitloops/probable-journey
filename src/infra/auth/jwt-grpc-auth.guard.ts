import { Injectable, ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtGrpcAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const call = context.switchToRpc().getContext();
    const metadata = call.internalRepr;
    const bearerToken = metadata['authorization'];

    if (!bearerToken) {
      throw new RpcException({
        code: 3,
        message: 'Missing required JWT token',
      });
    }

    try {
      const token = bearerToken.replace('Bearer ', '');
      const secret = this.configService.get('JWT_SECRET');
      const decoded = jwt.verify(token, secret);

      call.decodedToken = decoded;
      return true;
    } catch (error) {
      throw new RpcException({ code: 7, message: 'Invalid JWT token' });
    }
  }
}
