import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEtapaDto } from './create-etapa.dto';

enum EstadoEtapa {
  Pendiente = 'Pendiente',
  En_Progreso = 'En_Progreso',
  Completada = 'Completada',
}

export class UpdateEtapaDto extends PartialType(CreateEtapaDto) {
  @ApiPropertyOptional({
    description: 'Estado de la etapa',
    enum: EstadoEtapa,
    example: EstadoEtapa.En_Progreso,
  })
  @IsOptional()
  @IsEnum(EstadoEtapa, { message: 'El estado debe ser un valor válido' })
  estado?: EstadoEtapa;
}
