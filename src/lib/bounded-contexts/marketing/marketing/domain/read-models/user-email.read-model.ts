export type TUserEmailReadModelSnapshot = {
    userId: string;
    email: string;
};

export class UserEmailReadModel {
    constructor(
        public readonly userId: string,
        public readonly email: string,
    ) { }

    static fromPrimitives(primitives: TUserEmailReadModelSnapshot): UserEmailReadModel {
        return new UserEmailReadModel(primitives.userId, primitives.email);
    }

    toPrimitives(): TUserEmailReadModelSnapshot {
        return {
            userId: this.userId,
            email: this.email,
        };
    }
}