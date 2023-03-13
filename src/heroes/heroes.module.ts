import { Module } from '@nestjs/common';
import { HeroesController } from './infra/controllers/heroes.controller';
import { KillDragonHandler } from './application/kill-dragon/kill-dragon.handler';
import { HeroRepository } from './infra/repository/hero.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { HEROES_REPOSITORY } from './heroes.di-tokens';
import { FindAllHeroesHandler } from './application/find-all-heroes/find-all-heroes.handler';
import { HeroKilledDragonHandler } from './application/hero-killed-dragon/hero-killed-dragon.handler';

const CommandHandlers = [KillDragonHandler];
const QueryHandlers = [FindAllHeroesHandler];
const DomainEventHandlers = [HeroKilledDragonHandler];

@Module({
  imports: [CqrsModule],
  controllers: [HeroesController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...DomainEventHandlers,
    {
      provide: HEROES_REPOSITORY,
      useClass: HeroRepository,
    },
  ],
})
export class HeroesModule {}
