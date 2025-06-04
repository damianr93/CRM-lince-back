import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose'
import { Client } from './schema/customer.schema';
import { CreateClientDto } from './dto/create-customer.dto';
import { UpdateClientDto } from './dto/update-customer.dto';

@Injectable()
export class ClientsService {
  constructor(
    @Inject('CLIENT_MODEL') private readonly clientModel: Model<Client>,
  ) {}

  create(dto: CreateClientDto) {
    return this.clientModel.create(dto);
  }

  findAll() {
    return this.clientModel.find().lean();
  }

  findOne(id: string) {
    return this.clientModel.findById(id).lean();
  }

  async update(id: string, dto: UpdateClientDto) {
    const updated = await this.clientModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('Cliente no encontrado');
    return updated;
  }

  remove(id: string) {
    return this.clientModel.findByIdAndDelete(id);
  }
}