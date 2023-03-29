import { Application, Either, ok } from '@src/bitloops/bl-boilerplate-core';
import { NotificationTemplateReadModel } from '../../../domain/read-models/notification-template.read-model';
import { NotificationTemplateReadRepoPort } from '../../../ports/notification-template-read.repo-port.';

export class MockNotificationTemplateReadRepo {
  public readonly mockGetByTypeMethod: jest.Mock;
  private mockNotificationTemplateReadRepo: NotificationTemplateReadRepoPort;

  constructor() {
    this.mockGetByTypeMethod = this.getMockGetByTypeMethod();
    this.mockNotificationTemplateReadRepo = {
      getByType: this.mockGetByTypeMethod,
      getAll: jest.fn(),
      getById: jest.fn(),
    };
  }

  getMockNotificationTemplateReadRepo(): NotificationTemplateReadRepoPort {
    return this.mockNotificationTemplateReadRepo;
  }

  private getMockGetByTypeMethod(): jest.Mock {
    return jest.fn(
      (
        type: string,
      ): Promise<
        Either<
          NotificationTemplateReadModel | null,
          Application.Repo.Errors.Unexpected
        >
      > => {
        return Promise.resolve(ok(null));
      },
    );
  }
}
