import { Controller, Get, Query, Res } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorators';

type LocationFilters = {
  startDate?: string;
  endDate?: string;
  provincias?: string[];
  paises?: string[];
  zonas?: string[];
};

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

  @Get('location-summary')
  locationSummary(@Query() query: Record<string, string>) {
    return this.analyticsService.locationSummary(this.normalizeLocationFilters(query));
  }

  @Get('location-heatmap')
  locationHeatmap(@Query() query: Record<string, string>) {
    return this.analyticsService.locationHeatmap(this.normalizeLocationFilters(query));
  }

  @Get('location-debug')
  locationDebug(@Query() query: Record<string, string>) {
    return this.analyticsService.locationDebug(this.normalizeLocationFilters(query));
  }

  @Public()
  @Get('location-map')
  async locationMap(@Res() res: Response, @Query() query: Record<string, string>) {
    const result = await this.analyticsService.locationMapImage(
      this.normalizeLocationFilters(query),
    );
    if (!result) {
      return res.status(204).send();
    }
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(result.buffer);
  }

  @Public()
  @Get('location-map-base64')
  async locationMapBase64(@Query() query: Record<string, string>) {
    const result = await this.analyticsService.locationMapImage(
      this.normalizeLocationFilters(query),
    );
    if (!result) {
      return { data: null, contentType: null };
    }
    return { data: result.buffer.toString('base64'), contentType: result.contentType };
  }

  @Get('location-report/pdf')
  async locationReportPdf(@Res() res: Response, @Query() query: Record<string, string>) {
    const buffer = await this.analyticsService.locationReportPdf(
      this.normalizeLocationFilters(query),
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_ubicacion.pdf"');
    res.send(buffer);
  }

  private normalizeLocationFilters(query: Record<string, string>): LocationFilters {
    const parseList = (value?: string) => {
      if (!value) return undefined;
      const parsed = value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      return parsed.length > 0 ? parsed : undefined;
    };

    return {
      startDate: query.startDate,
      endDate: query.endDate,
      provincias: parseList(query.provincias),
      paises: parseList(query.paises),
      zonas: parseList(query.zonas),
    };
  }

}
