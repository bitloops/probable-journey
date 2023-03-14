import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HeroesController } from './heroes.controller';

@Module({
  imports: [CqrsModule],
  controllers: [HeroesController],
})
export class HeroesModule {}
