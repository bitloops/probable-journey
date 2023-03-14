import { Application } from '@bitloops/bl-boilerplate-core';
import { TodoReadModel } from '../domain/TodoReadModel.js';

export type TodoReadRepoPort = Application.Repo.ICRUDReadPort<TodoReadModel>;

// export interface ITodoReadRepository {
//   findAll(): Promise<TodoReadModel[]>;
// }

export const TodoReadRepoPortToken = Symbol('TodoReadRepoPort');
