import { Body, Controller, Post } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';

@Controller('openai')
export class OpenAIController {
  constructor(private readonly geminiService: GeminiService) {}
  @Post('analyse-comment')
  async analyseComment(@Body() body: { comment: string }): Promise<string> {
    try {
      return await this.geminiService.analyseComment(body.comment);
    } catch (error) {
      console.error('Error analyzing comment:', error);
      throw new Error('Failed to analyze comment');
    }
  }
}
