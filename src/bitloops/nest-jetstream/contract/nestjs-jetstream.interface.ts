export interface IEventStoreMessage {
  subjectPrefix: string;
  createdAt: Date;
  eventId: string;
  eventNumber?: number;
  eventType: string;
  eventData: object;
}
