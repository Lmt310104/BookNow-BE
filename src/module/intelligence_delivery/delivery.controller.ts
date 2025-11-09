import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeliveryService } from './delivery.service';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}
  @Post('import-orders')
  @UseInterceptors(FileInterceptor('file'))
  async importOrders(@UploadedFile() file: Express.Multer.File) {
    return await this.deliveryService.importOrdersFromExcel(file);
  }

  @Post('planning-routes')
  async planningRoutes(@Body() body: { date: Date }) {
    return await this.deliveryService.planningRoutes(body.date);
  }

  @Get('get-planing-results')
  async getPlaningResults(@Body() body: { date: Date }) {
    return await this.deliveryService.getPlaningResults(body.date);
  }

  @Get('get-scheduled-orders/:orderId')
  async getScheduledOrders(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return await this.deliveryService.getScheduledOrderById(orderId);
  }

  @Public()
  @Get('export-orders-every-driver')
  async exportOrdersEveryDriver(
    @Query('date') date: string,
    @Res() res: Response,
  ) {
    return await this.deliveryService.exportOrdersToExcelForEveryDriver(
      new Date(date),
      res,
    );
  }
}
