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
      const prompt = `Hãy viết một đoạn giới thiệu ngắn gọn và súc tích về cuốn sách "${bookname}" cùng tác giả ${bookauthor || ''}. Đoạn giới thiệu cần bao gồm:
      1. Chủ đề chính của cuốn sách.
      2. Tóm tắt nội dung nổi bật.
      3. Những thông tin đáng chú ý về tiểu sử hoặc thành tựu của tác giả (nếu có). 
      Hãy đảm bảo văn phong hấp dẫn, dễ tiếp cận và phù hợp với người đọc phổ thông.`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response.text();

      return response;
    } catch (error) {
      console.error('Error generating book summary:', error);
      throw new Error(`Failed to generate book summary: ${error.message}`);
    }
  }
}
