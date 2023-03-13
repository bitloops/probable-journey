import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { KillDragonCommand } from './kill-dragon.command';
import { HeroRepository } from '../../infra/repository/hero.repository';
import { Inject } from '@nestjs/common';
import { HEROES_REPOSITORY } from '../../heroes.di-tokens';

@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    @Inject(HEROES_REPOSITORY)
    private repository: HeroRepository,
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
