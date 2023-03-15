import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserEmailReadModel } from '@src/lib/bounded-contexts/marketing/marketing/domain/read-models/userEmailReadModel';
import { HydratedDocument } from 'mongoose';

export type UserEmailDocument = HydratedDocument<UserEmailReadModel>;

@Schema()
export class UserEmail {
    @Prop()
    _id: string;
    @Prop()
    email: string;
}

export const EmailSchema = SchemaFactory.createForClass(UserEmail);
