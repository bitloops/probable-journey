import { Injectable } from '@nestjs/common';
import { Hero } from '../../domain/hero.entity';
import { HeroRepositoryPort } from './hero.repository.port';

export const userHero = new Hero('1234');

@Injectable()
export class HeroRepository implements HeroRepositoryPort {
  async findOneById(id: number): Promise<Hero> {
    return userHero;
  }

  async findAll(): Promise<Hero[]> {
    return [userHero];
  }
}
