import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { TipoEvento, EstadoEvento } from './create-evento.dto';

export class FiltrarEventosDto {
  @ApiPropertyOptional({
    description: 'Filtrar por usuario (creador o participante)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  usuarioId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por proyecto',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  proyectoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de evento',
    enum: TipoEvento,
    example: TipoEvento.Reunion,
  })
  @IsEnum(TipoEvento)
  @IsOptional()
  tipo?: TipoEvento;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: EstadoEvento,
    example: EstadoEvento.Pendiente,
  })
  @IsEnum(EstadoEvento)
  @IsOptional()
  estado?: EstadoEvento;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango',
    example: '2025-11-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango',
    example: '2025-11-30T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  fechaHasta?: string;
}
