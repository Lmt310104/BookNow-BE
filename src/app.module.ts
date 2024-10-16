import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Modules from './module';
import configuration from './config/configuration';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
      load: [configuration],
    }),
    ...Modules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
