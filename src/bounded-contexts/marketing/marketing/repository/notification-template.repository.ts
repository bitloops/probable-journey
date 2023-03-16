import { Domain } from '@bitloops/bl-boilerplate-core';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationTemplateReadRepoPort } from '@src/lib/bounded-contexts/marketing/marketing/ports/notification-template-read.repo-port.';
import { NotificationTemplateReadModel } from '@src/lib/bounded-contexts/marketing/marketing/domain/read-models/notification-template.read-model';
@Injectable()
export class NotificationTemplateReadRepository implements NotificationTemplateReadRepoPort {
    getByType(type: string): Promise<NotificationTemplateReadModel | null> {
        throw new Error('Method not implemented.');
    }
    getAll(): Promise<NotificationTemplateReadModel[] | null> {
        throw new Error('Method not implemented');
    }
    getById(id: string): Promise<NotificationTemplateReadModel | null> {
        throw new Error('Method not implemented');
    }
}