import { Controller, Post, Body, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { KillDragonCommand } from 'src/heroes/application/kill-dragon/kill-dragon.command';
import { KillDragonDto } from './dto/kill-dragon.dto';

@Controller('heroes')
export class HeroesController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Post()
  async killDragon(@Body() killDragonDto: KillDragonDto) {
    const { heroId, dragonId } = killDragonDto;
    const command = new KillDragonCommand(heroId, dragonId);
    const result = await this.commandBus.execute(command);
    return result;
  }

  // @Get()
  // async findAll() {
  //   const query = new FindAllHeroesQuery();
  //   const result = await this.queryBus.execute(query);
  //   return result;
  // }
}
