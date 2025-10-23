import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { TipoDocumentoProyecto } from '@prisma/client';

export class CreateDocumentoProyectoDto {
  @ApiProperty({
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  proyectoId: string;

  @ApiProperty({
    description: 'Tipo de documento',
    enum: TipoDocumentoProyecto,
    example: TipoDocumentoProyecto.Resumen,
  })
  @IsEnum(TipoDocumentoProyecto)
  tipo: TipoDocumentoProyecto;

  @ApiProperty({
    description: 'Título del documento',
    example: 'Resumen Ejecutivo del Proyecto',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  titulo: string;

  @ApiProperty({
    description: 'Contenido del documento',
    example: 'Este proyecto tiene como objetivo...',
  })
  @IsString()
  contenido: string;

  @ApiPropertyOptional({
    description: 'ID del archivo adjunto (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  archivoId?: string;
}
