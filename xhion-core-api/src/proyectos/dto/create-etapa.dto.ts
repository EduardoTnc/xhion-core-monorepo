import { IsString, IsOptional, IsInt, Min, IsDateString, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEtapaDto {
  @ApiProperty({
    description: 'Nombre de la etapa',
    example: 'Diseño y Planificación',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción de la etapa',
    example: 'Fase inicial de diseño de mockups y definición de requisitos',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Color de la etapa en formato hexadecimal',
    example: '#3B82F6',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe estar en formato hexadecimal (#RRGGBB)' })
  color?: string;

  @ApiProperty({
    description: 'Orden de la etapa en el proyecto (debe ser único)',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(1, { message: 'El orden debe ser al menos 1' })
  orden: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de la etapa (formato ISO 8601)',
    example: '2025-10-20',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin de la etapa (formato ISO 8601)',
    example: '2025-11-20',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fechaFin?: string;
}
