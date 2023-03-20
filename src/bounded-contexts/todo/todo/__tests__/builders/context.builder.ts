import { TContext } from '@src/lib/bounded-contexts/todo/todo/types';

export class ContextBuilder {
  private userId: string;
  private jwt: string;

  withJWT(jwt: string): ContextBuilder {
    this.jwt = jwt;
    return this;
  }

  withUserId(userId: string): ContextBuilder {
    this.userId = userId;
    return this;
  }

  build(): TContext {
    const context: TContext = {
      userId: this.userId,
      jwt: this.jwt,
    };
    return context;
  }
}
