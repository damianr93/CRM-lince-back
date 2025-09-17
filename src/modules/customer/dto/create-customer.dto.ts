import {
  IsString,
  IsEmail,
  IsEnum,
  MaxLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum Actividad {
  CRIA = 'CRIA',
  RECRIA = 'RECRIA',
  MIXTO = 'MIXTO',
  DISTRIBUIDOR = 'DISTRIBUIDOR',
}

export class CreateClientDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del cliente' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  nombre?: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del cliente' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  apellido?: string;

  @ApiProperty({
    example: '+54 9 351 555-1234',
    description: 'Teléfono de contacto',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  telefono!: string;

  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electrónico',
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  correo?: string;

  @ApiProperty({
    example: 120,
    minimum: 0,
    description: 'Cantidad de cabezas de ganado (se almacena como string)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  cabezas?: string;

  @ApiProperty({
    example: 6,
    minimum: 0,
    description: 'Meses que va a suplementar (se almacena como string)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  mesesSuplemento?: string;

  @ApiProperty({
    example: 'PIPO Bovino 18%',
    description: 'Producto consultado/comprado',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  producto?: string;

  @ApiProperty({ example: 'Córdoba', description: 'Localidad del cliente' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  localidad?: string;

  @ApiProperty({ enum: Actividad, description: 'Actividad principal' })
  @IsOptional()
  @IsEnum(Actividad)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  actividad?: Actividad;

  @ApiPropertyOptional({
    example: 'Prefiere entrega los lunes por la mañana',
    description: 'Observaciones adicionales',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  observaciones?: string;

  @ApiProperty({
    enum: ['EZEQUIEL', 'DENIS', 'MARTIN', 'SIN_ASIGNAR'],
    default: 'SIN_ASIGNAR',
    description: 'Quién está siguiendo al cliente',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  siguiendo?: 'EZEQUIEL' | 'DENIS' | 'MARTIN' | 'SIN_ASIGNAR';

  @ApiProperty({
    enum: ['INSTAGRAM', 'WEB', 'WHATSAPP', 'FACEBOOK', 'OTRO'],
    default: 'OTRO',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  medioAdquisicion?: 'INSTAGRAM' | 'WEB' | 'WHATSAPP' | 'FACEBOOK' | 'OTRO';

  @ApiProperty({
    enum: ['COMPRO', 'NO_COMPRO', 'PENDIENTE'],
    default: 'PENDIENTE',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  estado?: 'PENDIENTE' | 'DERIVADO_A_DISTRIBUIDOR' | 'NO_CONTESTO' | 'SE_COTIZO_Y_PENDIENTE' | 'SE_COTIZO_Y_NO_INTERESO' | 'COMPRO';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  createdAt?: string;
}
