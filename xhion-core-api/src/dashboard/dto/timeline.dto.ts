import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

/**
 * DTOs para el Timeline del Dashboard
 */

export class GetTimelineQueryDto {
  @ApiPropertyOptional({ description: 'ID del departamento para filtrar' })
  @IsOptional()
  @IsString()
  departamentoId?: string;

  @ApiPropertyOptional({ 
    description: 'Estado del proyecto',
    enum: ['Activo', 'Completado', 'En_Pausa', 'Archivado']
  })
  @IsOptional()
  @IsEnum(['Activo', 'Completado', 'En_Pausa', 'Archivado'])
  estado?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio del rango' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin del rango' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

export class ActualizarFechasProyectoDto {
  @ApiPropertyOptional({ description: 'Nueva fecha de inicio' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Nueva fecha de fin' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

export class ResolverAlertaDto {
  @ApiProperty({ description: 'Acción tomada para resolver la alerta' })
  @IsString()
  accion: string;
}
