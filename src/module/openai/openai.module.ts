import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { OpenAIController } from './openai.controller';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [ConfigModule, GeminiModule],
  controllers: [OpenAIController],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
