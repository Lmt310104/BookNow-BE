import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('health')
export class HealthCheckController {
  @Get()
  async checkHealth(@Res() res: Response) {
    res.status(200).json({ status: 'ok' });
  }

  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    const metrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
    res.status(200).json(metrics);
  }
}
