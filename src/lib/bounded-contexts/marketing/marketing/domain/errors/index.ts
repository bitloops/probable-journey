import { InvalidTodosCounterError as InvalidTodosCounter} from "./invalid-todos-counter.error";
export namespace DomainErrors {
    export class InvalidTodosCounterError extends InvalidTodosCounter {}
}