import { Domain } from '@src/bitloops/bl-boilerplate-core';
import {
  UserEntity,
  UserProps,
} from '@src/lib/bounded-contexts/iam/authentication/domain/UserEntity';
import { CompletedTodosVO } from '@src/lib/bounded-contexts/marketing/marketing/domain/completed-todos.vo';
import { EmailVO } from '../../domain/EmailVO';

export class UserEntityBuilder {
  private id: string;
  private email: string;
  private password: string;

  withEmail(email: string): UserEntityBuilder {
    this.email = email;
    return this;
  }

  withId(id: string): UserEntityBuilder {
    this.id = id;
    return this;
  }

  withPassword(password: string): UserEntityBuilder {
    this.password = password;
    return this;
  }

  build(): UserEntity {
    const userProps: UserProps = {
      email: EmailVO.create({ email: this.email }).value as EmailVO,
      password: this.password,
    };
    if (this.id) {
      userProps.id = new Domain.UUIDv4(this.id);
    }

    const userEntity = UserEntity.create(userProps).value as UserEntity;
    return userEntity;
  }
}
