import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Client } from './schema/customer.schema';
import { CreateClientDto } from './dto/create-customer.dto';
import { UpdateClientDto } from './dto/update-customer.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ClientsService {
  constructor(
    @Inject('CLIENT_MODEL') private readonly clientModel: Model<Client>,
  ) {}

  async create(dto: CreateClientDto) {
    try {
      const createdCustomer = await this.clientModel.create(dto);

      if (!createdCustomer) {
        throw new BadRequestException('Error al crear el cliente');
      }

      return createdCustomer;
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

  findAll() {
    try {
      const clients = this.clientModel.find().lean().sort({ createdAt: -1 });
      return clients;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los clientes');
    }
  }

  findOne(id: string) {
    return this.clientModel.findById(id).lean();
  }

  async update(id: string, dto: UpdateClientDto) {
    try {
      const updated = await this.clientModel
        .findByIdAndUpdate(id, dto, { new: true })
        .lean();
      if (!updated) throw new NotFoundException('Cliente no encontrado');
      return updated;
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  remove(id: string) {
    try {
      return this.clientModel.findByIdAndDelete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }

  async generateExcel(res: Response): Promise<void> {
    const clients = await this.clientModel.find();
    if (!clients || clients.length === 0) {
      throw new NotFoundException('No hay clientes para exportar');
    }

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Tu App CRM';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Clientes');

    sheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Actividad', key: 'actividad', width: 15 },
      { header: 'Siguiendo', key: 'siguiendo', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Creado El', key: 'createdAt', width: 20 },
      { header: 'Producto', key: 'producto', width: 25 },
      { header: 'Localidad', key: 'localidad', width: 20 },
      { header: 'Cabezas', key: 'cabezas', width: 10 },
      { header: 'Meses Supl.', key: 'mesesSuplemento', width: 12 },
      { header: 'Medio Adq.', key: 'medioAdquisicion', width: 15 },
    ];

    clients.forEach((c: any) => {
      let createdAtStr = '-';
      if (c.createdAt) {
        const d = new Date(c.createdAt);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        createdAtStr = `${yyyy}/${mm}/${dd}`;
      }

      sheet.addRow({
        nombre: c.nombre || '',
        telefono: c.telefono || '',
        actividad: c.actividad || '',
        siguiendo: c.siguiendo || '',
        estado: c.estado || '',
        createdAt: createdAtStr,
        producto: c.producto || '',
        localidad: c.localidad || '',
        cabezas: c.cabezas ?? '',
        mesesSuplemento: c.mesesSuplemento ?? '',
        medioAdquisicion: c.medioAdquisicion || '',
      });
    });

    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="clientes_completos.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
