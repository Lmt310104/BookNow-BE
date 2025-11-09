import { ConfigService } from '@nestjs/config';
import { ApiClient, requests } from 'recombee-api-client';

export type RecombeeProvider = { client: ApiClient; rqs: typeof requests };
export const RecombeeAIProvider = {
  provide: 'RECOMBEEAI',
  useFactory: (configService: ConfigService): RecombeeProvider => {
    const client = new ApiClient(
      configService.get<string>('recombee_database'),
      configService.get<string>('recombee_secret'),
      {
        region: configService.get<string>('recombee_region'),
      },
    );
    const rqs = requests;
    return { client, rqs };
  },
  inject: [ConfigService],
};
