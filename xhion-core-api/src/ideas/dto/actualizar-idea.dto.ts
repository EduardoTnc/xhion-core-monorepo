import { PartialType } from '@nestjs/swagger';
import { CrearIdeaDto } from './crear-idea.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoIdea } from '@prisma/client';

export class ActualizarIdeaDto extends PartialType(CrearIdeaDto) {
  @ApiPropertyOptional({ enum: EstadoIdea, description: 'Estado de la idea' })
  @IsOptional()
  @IsEnum(EstadoIdea)
  estado?: EstadoIdea;
}
