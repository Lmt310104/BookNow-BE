import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Modules from './module';
import configuration from './config/configuration';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { createKeyv } from '@keyv/redis';
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
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [createKeyv('redis://localhost:6379')],
        };
      },
      isGlobal: true,
    }),

    ...Modules,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
