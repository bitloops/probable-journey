// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { TodoWriteRepository } from './repository/todo-write.repository';
// import { TodoWriteRepoPortToken } from './ports/TodoWriteRepoPort';
// import { Todo, TodoSchema } from './repository/schema/todo.schema';
// import { TodoReadRepoPortToken } from './ports/TodoReadRepoPort';
// import { TodoReadRepository } from './repository/todo-read.repository';

// @Module({
//   imports: [
//     TodoModule,
//     MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
//   ],
//   controllers: [],
//   providers: [
//     {
//       provide: TodoWriteRepoPortToken,
//       useClass: TodoWriteRepository,
//     },
//     {
//       provide: TodoReadRepoPortToken,
//       useClass: TodoReadRepository,
//     },
//   ],
// })
// export class TodoModule {}
