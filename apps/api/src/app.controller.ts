import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @ApiOperation({ summary: '루트 메시지 확인' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @ApiOperation({ summary: '헬스체크' })
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
