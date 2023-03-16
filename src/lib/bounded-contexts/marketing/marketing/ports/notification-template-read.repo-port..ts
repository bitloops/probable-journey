import { Application } from '@bitloops/bl-boilerplate-core';
import { NotificationTemplateReadModel } from '../domain/read-models/notification-template.read-model';

export interface NotificationTemplateReadRepoPort
  extends Application.Repo.ICRUDReadPort<NotificationTemplateReadModel> {
  getByType(type: string): Promise<NotificationTemplateReadModel | null>;
}

export const NotificationTemplateReadRepoPortToken = Symbol('NotificationTemplateReadRepoPort');