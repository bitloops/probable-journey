import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { HeroKilledDragonEvent } from 'src/heroes/domain/events/hero-killed-dragon.event';

@EventsHandler(HeroKilledDragonEvent)
export class HeroKilledDragonHandler
  implements IEventHandler<HeroKilledDragonEvent>
{
  async handle(event: HeroKilledDragonEvent): Promise<void> {
    console.log('RECEIVED EVENT: HeroKilledDragonEvent');
    console.log('HeroKilledDragonHandler', event);
  }
}
