import { Hero } from '../../domain/hero.entity';

export interface HeroRepositoryPort {
  findOneById(id: number): Promise<Hero>;
  findAll(): Promise<Hero[]>;
  save(hero: Hero): Promise<Hero>;
}
