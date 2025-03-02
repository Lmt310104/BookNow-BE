// import { ConfigService } from '@nestjs/config';


// export const RecombeeAIProvider = {
//   provide: 'RECOMBEEAI',
//   useFactory: (configService: ConfigService): any => {
//     const Recombee = require('recombee-api-client');
//     const client = new Recombee.ApiClient(
//       configService.get<string>('recombee_database'),
//       configService.get<string>('recombee_secret'),
//     );
//     return client;
//   },
//   inject: [ConfigService],
// };
