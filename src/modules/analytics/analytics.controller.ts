import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('totales')
  totales() {
    return this.analyticsService.totales();
  }

  @Get('evolucion')
  evolution() {
    return this.analyticsService.evolution();
  }

  @Get('demand-of-product')
  demandOfProduct() {
    return this.analyticsService.demandOfProduct();
  }

  @Get('status')
  purchaseStatus() {
    return this.analyticsService.purchaseStatus();
  }

  @Get('follow-up-events')
  followUpEvents(
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
  ) {
    return this.analyticsService.followUpEvents(assignedTo, status);
  }

}
