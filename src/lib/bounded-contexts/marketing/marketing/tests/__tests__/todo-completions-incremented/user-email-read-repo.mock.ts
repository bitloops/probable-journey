// import {
//   Application,
//   Domain,
//   Either,
//   ok,
//   fail,
// } from '@src/bitloops/bl-boilerplate-core';
// import { UserEntity } from '@src/lib/bounded-contexts/marketing/marketing/domain/user.entity';
// import { UserEmailReadRepoPort } from '../../../ports/user-email-read.repo-port';

// export class MockUserEmailReadRepo {
//   public readonly mockGetUserEmailMethod: jest.Mock;
//   private mockUserEmailReadRepo: UserEmailReadRepoPort;

//   constructor() {
//     this.mockGetUserEmailMethod = this.getMockGetUserEmailMethod();
//     this.mockUserEmailReadRepo = {
//       getUserEmail: this.mockGetUserEmailMethod,
//       save: jest.fn(),
//       create: jest.fn(),
//       getAll: jest.fn(),
//       getById: jest.fn(),
//     };
//   }

//   getMockUserEmailReadRepo(): UserEmailReadRepoPort {
//     return this.mockUserEmailReadRepo;
//   }

//   private getMockGetUserEmailMethod(): jest.Mock {
//     return jest.fn(
//       (
//         user: UserEntity,
//       ): Promise<Either<void, Application.Repo.Errors.Unexpected>> => {
//         // if (
//         //   user.id.equals(new Domain.UUIDv4(INCREMENT_TODOS_SUCCESS_CASE.userId))
//         // ) {
//         //   return Promise.resolve(
//         //     fail(new Application.Repo.Errors.Unexpected('Unexpected error')),
//         //   );
//         // }
//         return Promise.resolve(ok());
//       },
//     );
//   }
// }
