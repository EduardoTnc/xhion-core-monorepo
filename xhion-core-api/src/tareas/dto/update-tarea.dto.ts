import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTareaDto } from './create-tarea.dto';

enum EstadoTarea {
  Por_Hacer = 'Por_Hacer',
  En_Progreso = 'En_Progreso',
  Hecho = 'Hecho',
  Bloqueado = 'Bloqueado',
}

export class UpdateTareaDto extends PartialType(CreateTareaDto) {
  @ApiPropertyOptional({
    description: 'Estado de la tarea',
    enum: EstadoTarea,
    example: EstadoTarea.En_Progreso,
  })
  @IsOptional()
  @IsEnum(EstadoTarea, { message: 'El estado debe ser un valor válido' })
  estado?: EstadoTarea;
}
