import { IEvent } from '../domain/events/IEvent';

// TODO Add generic to IHandle
export interface IHandle<IResponse = any> {
  get event(): any;
  get boundedContext(): string;
  handle(event: IEvent<any>): Promise<IResponse>;
}
