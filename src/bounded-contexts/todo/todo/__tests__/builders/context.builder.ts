type Context = {
  user: { id: string };
};

export class ContextBuilder {
  private userId: string;

  withUserId(userId: string): ContextBuilder {
    this.userId = userId;
    return this;
  }

  build(): Context {
    const context: Context = {
      user: { id: this.userId },
    };
    return context;
  }
}
