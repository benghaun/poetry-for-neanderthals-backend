import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameController } from './game/game.controller';
import { RoundController } from './round/round.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'static') }),
  ],
  controllers: [GameController, RoundController],
  providers: [],
})
export class AppModule {}
