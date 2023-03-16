import { EmailNotFoundError as EmailNotFound } from './email-not-found.error';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ApplicationErrors {
    export class EmailNotFoundError extends EmailNotFound { }
}