import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service';
import { successResponse } from './common/http/response.util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    try {
      const data = await this.appService.getHealth();
      return successResponse(data);
    } catch {
      throw new ServiceUnavailableException({
        code: 'DB_UNAVAILABLE',
        message: 'Database is unreachable',
      });
    }
  }
}
