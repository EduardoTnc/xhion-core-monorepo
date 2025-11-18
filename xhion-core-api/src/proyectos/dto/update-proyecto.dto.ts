import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProyectoDto } from './create-proyecto.dto';

enum EstadoProyecto {
  Activo = 'Activo',
  Completado = 'Completado',
  En_Pausa = 'En_Pausa',
  Archivado = 'Archivado',
}

export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {
  @ApiPropertyOptional({
    description: 'Estado del proyecto',
    enum: EstadoProyecto,
    example: EstadoProyecto.Activo,
  })
  @IsOptional()
  @IsEnum(EstadoProyecto, { message: 'El estado debe ser un valor válido' })
  estado?: EstadoProyecto;

  @ApiPropertyOptional({
    description: 'Permite activar/desactivar la gestión de etapas en el proyecto',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'usaEtapas debe ser un valor booleano' })
  usaEtapas?: boolean;
}
