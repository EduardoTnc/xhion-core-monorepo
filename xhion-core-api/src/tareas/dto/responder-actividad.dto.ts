import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class ResponderActividadDto {
  @ApiProperty({ description: 'Contenido de la respuesta a la actividad' })
  @IsString()
  @MaxLength(1000)
  @IsNotEmpty()
  descripcion: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales asociados a la respuesta',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
