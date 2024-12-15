import { Controller, Post, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Request } from 'express';

@Controller()
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}
  @Public()
  @Post('webhook/search-book')
  async searchBook(@Req() req: Request) {
    const response = await this.webhookService.searchBook(req);
    return response;
  }
  @Public()
  @Post('webhook/search-order')
  async searchOrder(@Req() req: Request) {
    const response = await this.webhookService.searchOrder(req);
    return response;
  }

  @Public()
  @Post('webhook/book-recommendation')
  async bookRecommendation(@Req() req: Request) {
    const response = await this.webhookService.bookRecommendation(req);
    return response;
  }

  @Public()
  @Post('webhook/order-book')
  async orderBook(@Req() req: Request) {
    const response = await this.webhookService.orderBook(req);
    return response;
  }

  @Public()
  @Post('webhook/book-details')
  async searchBookDetails(@Req() req: Request) {
    const response = await this.webhookService.searchBookDetails(req);
    return response;
  }
}
