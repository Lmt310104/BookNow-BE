import { ConfigService } from '@nestjs/config';
import * as Recombee from 'recombee-api-client';

export const RecombeeAIProvider = {
  provide: 'RECOMBEEAI',
  useFactory: (configService: ConfigService): any => {
    const client = new Recombee.ApiClient(
      configService.get<string>('recombee_database'),
      configService.get<string>('recombee_secret'),
    );
    return client;
  },
  inject: [ConfigService],
};
