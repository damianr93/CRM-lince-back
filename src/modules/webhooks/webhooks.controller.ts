import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorators';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Public()
  @Post('ycloud')
  @HttpCode(200)
  async handleYCloud(@Body() body: any) {
    await this.webhooksService.processYCloudEvent(body);
    return { ok: true };
  }
}
