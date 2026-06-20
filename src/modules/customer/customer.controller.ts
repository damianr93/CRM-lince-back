import { Body, Controller, Get, Param, Patch, Post, Delete, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { ClientsService } from './customer.service';
import { CreateClientDto } from './dto/create-customer.dto';
import { UpdateClientDto } from './dto/update-customer.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.clientsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 100,
    );
  }

  @Get('export/excel')
  async downloadExcel(@Res() res: Response) {
    await this.clientsService.generateExcel(res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}