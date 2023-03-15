import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserEntity } from '@src/lib/bounded-contexts/marketing/marketing/domain/UserEntity';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserEntity>;

@Schema()
export class User {
  @Prop()
  completedTodos: number;
  @Prop()
  userId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
