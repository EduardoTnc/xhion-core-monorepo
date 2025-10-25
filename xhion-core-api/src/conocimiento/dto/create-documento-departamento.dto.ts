import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, MaxLength } from 'class-validator';
import { TipoDocumentoDepartamento } from '@prisma/client';

export class CreateDocumentoDepartamentoDto {
  @ApiProperty({
    description: 'ID del departamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  departamentoId: string;

  @ApiProperty({
    description: 'Tipo de documento',
    enum: TipoDocumentoDepartamento,
    example: TipoDocumentoDepartamento.Resumen,
  })
  @IsEnum(TipoDocumentoDepartamento)
  tipo: TipoDocumentoDepartamento;

  @ApiProperty({
    description: 'Título del documento',
    example: 'Resumen del Departamento',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  titulo: string;

  @ApiProperty({
    description: 'Contenido del documento',
    example: 'Este departamento tiene como objetivo...',
  })
  @IsString()
  contenido: string;
}
