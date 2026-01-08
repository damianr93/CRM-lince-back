import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-customer.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}
