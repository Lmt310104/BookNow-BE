import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Modules from './module';
import configuration from './config/configuration';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
      load: [configuration],
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),

    ...Modules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
