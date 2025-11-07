import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsDateString, IsBoolean, IsOptional, IsUUID, MaxLength } from 'class-validator';

export enum TipoEvento {
  Reunion = 'Reunion',
  Tarea = 'Tarea',
  Proyecto = 'Proyecto',
  Personal = 'Personal',
  Recordatorio = 'Recordatorio',
}

export enum EstadoEvento {
  Pendiente = 'Pendiente',
  En_Curso = 'En_Curso',
  Completado = 'Completado',
  Cancelado = 'Cancelado',
}

export class CreateEventoDto {
  @ApiProperty({
    description: 'Título del evento',
    example: 'Reunión de planificación Sprint 8',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del evento',
    example: 'Planificación y asignación de tareas para el Sprint 8',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de evento',
    enum: TipoEvento,
    example: TipoEvento.Reunion,
  })
  @IsEnum(TipoEvento)
  tipo: TipoEvento;

  @ApiPropertyOptional({
    description: 'Estado del evento',
    enum: EstadoEvento,
    example: EstadoEvento.Pendiente,
    default: EstadoEvento.Pendiente,
  })
  @IsEnum(EstadoEvento)
  @IsOptional()
  estado?: EstadoEvento;

  @ApiProperty({
    description: 'Fecha y hora de inicio del evento',
    example: '2025-11-10T09:00:00.000Z',
  })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha y hora de fin del evento',
    example: '2025-11-10T10:00:00.000Z',
  })
  @IsDateString()
  fechaFin: string;

  @ApiPropertyOptional({
    description: 'Indica si el evento dura todo el día',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  todoElDia?: boolean;

  @ApiPropertyOptional({
    description: 'Ubicación del evento',
    example: 'Sala de Juntas 2 - Edificio Principal',
    maxLength: 300,
  })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  ubicacion?: string;

  @ApiPropertyOptional({
    description: 'Color del evento en formato hex',
    example: '#3B82F6',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({
    description: 'ID del proyecto relacionado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  proyectoId?: string;

  @ApiPropertyOptional({
    description: 'ID de la tarea relacionada',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  tareaId?: string;

  @ApiPropertyOptional({
    description: 'IDs de los participantes del evento',
    example: ['123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174003'],
    type: [String],
  })
  @IsUUID('4', { each: true })
  @IsOptional()
  participantesIds?: string[];
}
