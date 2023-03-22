import { Module, DynamicModule } from '@nestjs/common';
import {
  JwtModuleOptions,
  JwtModule,
  JwtModuleAsyncOptions,
} from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({})
export class JwtAuthModule {
  static register(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtAuthModule,
      imports: [JwtModule.register(options)],
      providers: [JwtStrategy],
      exports: [JwtModule],
    };
  }

  static registerAsync(options: JwtModuleAsyncOptions): DynamicModule {
    return {
      module: JwtAuthModule,
      imports: [JwtModule.registerAsync(options)],
      providers: [JwtStrategy],
      exports: [JwtModule],
    };
  }
}
