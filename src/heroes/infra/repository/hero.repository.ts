import { EventPublisher, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Hero } from '../../domain/hero.entity';
import { HeroRepositoryPort } from './hero.repository.port';

export const userHero = new Hero('1234');

@Injectable()
export class HeroRepository implements HeroRepositoryPort {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly eventBus: EventBus,
  ) {}
  async findOneById(id: number): Promise<Hero> {
    return this.publisher.mergeObjectContext(userHero);
    // return userHero;
  }

  async findAll(): Promise<Hero[]> {
    return [userHero];
  }

  async save(hero: Hero): Promise<Hero> {
    // this.connnection.save(hero.toPrimitives())
    // this.publisher.publish(hero.events);

    // this.eventBus.publish(hero.events);

    return hero;
  }
}
