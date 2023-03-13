import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { KillDragonCommand } from './kill-dragon.command';
import { Inject } from '@nestjs/common';
import { HEROES_REPOSITORY } from '../../heroes.di-tokens';
import { HeroRepositoryPort } from 'src/heroes/infra/repository/hero.repository.port';

@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    @Inject(HEROES_REPOSITORY)
    private repository: HeroRepositoryPort,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: KillDragonCommand): Promise<void> {
    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
    );

    hero.killEnemy(dragonId);
    hero.commit();
  }
}
