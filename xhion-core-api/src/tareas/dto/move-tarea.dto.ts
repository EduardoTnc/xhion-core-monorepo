import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum EstadoTarea {
  Por_Hacer = 'Por_Hacer',
  En_Progreso = 'En_Progreso',
  Hecho = 'Hecho',
  Bloqueado = 'Bloqueado',
}

export class MoveTareaDto {
  @ApiPropertyOptional({
    description: 'ID de la nueva etapa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El etapaId debe ser un UUID válido' })
  etapaId?: string;

  @ApiProperty({
    description: 'Nuevo estado de la tarea',
    enum: EstadoTarea,
    example: EstadoTarea.En_Progreso,
  })
  @IsEnum(EstadoTarea, { message: 'El estado debe ser un valor válido' })
  estado: EstadoTarea;
}
