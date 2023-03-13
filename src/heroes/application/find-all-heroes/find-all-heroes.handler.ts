import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { KillDragonCommand } from '../kill-dragon/kill-dragon.command';
import { HeroRepository } from '../../infra/repository/hero.repository';
import { Inject } from '@nestjs/common';
import { HEROES_REPOSITORY } from '../../heroes.di-tokens';
import { Hero } from '../../domain/hero.entity';

@QueryHandler(QueryHandler)
export class FindAllHeroesHandler implements IQueryHandler<KillDragonCommand> {
  constructor(
    @Inject(HEROES_REPOSITORY)
    private repository: HeroRepository,
  ) {}

  async execute(): Promise<Hero[]> {
    return this.repository.findAll();
  }
}
