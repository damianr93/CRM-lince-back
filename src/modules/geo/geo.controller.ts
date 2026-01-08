import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('search')
  async search(@Query('q') query?: string, @Query('limit') limit?: string) {
    const trimmed = query?.trim();
    if (!trimmed || trimmed.length < 3) {
      throw new BadRequestException('La búsqueda debe tener al menos 3 caracteres');
    }
    const parsedLimit = limit ? Number(limit) : 6;
    return this.geoService.search(trimmed, Number.isFinite(parsedLimit) ? parsedLimit : 6);
  }

  @Get('argentina-provinces')
  async argentinaProvinces() {
    return this.geoService.argentinaProvincesGeoJson();
  }
}
