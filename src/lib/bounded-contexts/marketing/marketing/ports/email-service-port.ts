export type SendEmailRequest = {
  origin: string;
  destination: string;
  content: string;
};

export interface EmailServicePort {
  send(data: SendEmailRequest): void;
}
