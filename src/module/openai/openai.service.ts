import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai_key');
    this.openai = new OpenAI({ apiKey });
  }

  async analyseComment(comment: string): Promise<string> {
    try {
      const response = await this.openai.completions.create({
        model: 'gpt-3.5-turbo',
        prompt: `Analyze the following comment: "${comment}" and classify it as one of the following categories: POSITIVE, NEGATIVE, CONSTRUCTIVE, SPAM, TOXIC.`,
        max_tokens: 100,
        temperature: 0.7,
      });
      return response.choices[0]?.text.trim() || 'Unable to analyze comment';
    } catch (error) {
      console.error('Error analyzing comment:', error);
      throw new Error('Failed to analyze comment');
    }
  }
}
