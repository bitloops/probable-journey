import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { KillDragonCommand } from '../kill-dragon/kill-dragon.command';
import { Inject } from '@nestjs/common';
import { HEROES_REPOSITORY } from '../../heroes.di-tokens';
import { Hero } from '../../domain/hero.entity';
import { HeroRepositoryPort } from 'src/heroes/infra/repository/hero.repository.port';

@QueryHandler(QueryHandler)
export class FindAllHeroesHandler implements IQueryHandler<KillDragonCommand> {
  constructor(
    @Inject(HEROES_REPOSITORY)
    private repository: HeroRepositoryPort,
  ) {}

  async execute(): Promise<Hero[]> {
    return this.repository.findAll();
  }
}
