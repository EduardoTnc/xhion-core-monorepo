import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum PrioridadTarea {
  Baja = 'Baja',
  Media = 'Media',
  Alta = 'Alta',
  Urgente = 'Urgente',
}

export class CreateTareaDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Implementar autenticación JWT',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  titulo: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la tarea',
    example: 'Configurar Passport.js con estrategia JWT y refresh tokens',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'ID del proyecto al que pertenece la tarea',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El proyectoId debe ser un UUID válido' })
  proyectoId: string;

  @ApiPropertyOptional({
    description: 'ID de la etapa a la que pertenece la tarea',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El etapaId debe ser un UUID válido' })
  etapaId?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario asignado a la tarea',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El asignadoId debe ser un UUID válido' })
  asignadoId?: string;

  @ApiPropertyOptional({
    description: 'Prioridad de la tarea',
    enum: PrioridadTarea,
    example: PrioridadTarea.Media,
    default: PrioridadTarea.Media,
  })
  @IsOptional()
  @IsEnum(PrioridadTarea, { message: 'La prioridad debe ser un valor válido' })
  prioridad?: PrioridadTarea;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento de la tarea (formato ISO 8601)',
    example: '2025-11-20',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha válida' })
  fechaVencimiento?: string;
}
