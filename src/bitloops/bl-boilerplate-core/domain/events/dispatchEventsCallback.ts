import { Container } from '../../Container';
import { UniqueEntityID } from '../UniqueEntityID';

export const dispatchEventsCallback = async (aggregateId: UniqueEntityID) => {
  // @CHANGED HERE
  // const { events } = Container.getServices();
  // await events.dispatchEventsForAggregate(aggregateId);
};
