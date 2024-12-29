// src/modules/gemini/gemini.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const gemini_api_key = this.configService.get<string>('gemini_api_key');

    if (!gemini_api_key) {
      throw new Error('Gemini API key is not configured');
    }

    this.genAI = new GoogleGenerativeAI(gemini_api_key);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
  }

  async generateBookSummary(
    bookname: string,
    bookauthor?: string,
  ): Promise<string> {
    try {
      if (!bookname) {
        throw new Error('Book name is required');
      }
      const prompt = `Giới thiệu ngắn về sách "${bookname}" của ${bookauthor || 'tác giả'}: nêu chủ đề, nội dung nổi bật, và thông tin đặc biệt về tác giả (nếu có).`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response.text();

      return response;
    } catch (error) {
      console.error('Error generating book summary:', error);
      throw new Error(`Failed to generate book summary: ${error.message}`);
    }
  }

  async analyseComment(comment: string): Promise<string> {
    try {
      if (!comment) {
        throw new Error('Comment is required');
      }
      const prompt = `Analyze the following comment: "${comment}" and classify it as exactly one of the following categories: POSITIVE, NEGATIVE, CONSTRUCTIVE, SPAM, or TOXIC.  
Respond with only the category name, without any additional explanation:`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response.text();
      return response;
    } catch (error) {
      console.error('Error analysing comment:', error);
      throw new Error(`Failed to analyse comment: ${error.message}`);
    }
  }
}
