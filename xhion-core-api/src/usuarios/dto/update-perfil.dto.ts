import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsISO8601, MaxLength } from 'class-validator';

export class UpdatePerfilDto {
  @ApiPropertyOptional({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez García',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre completo no puede exceder 100 caracteres' })
  nombreCompleto?: string;

  @ApiPropertyOptional({
    description: 'Biografía del usuario',
    example: 'Desarrollador Full Stack con 5 años de experiencia',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'La biografía debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La biografía no puede exceder 500 caracteres' })
  biografia?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del usuario',
    example: '1990-05-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'La fecha de nacimiento debe ser una fecha válida en formato ISO 8601' })
  fechaNacimiento?: string;

  @ApiPropertyOptional({
    description: 'Fecha de ingreso del usuario a la empresa',
    example: '2020-01-10T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'La fecha de ingreso debe ser una fecha válida en formato ISO 8601' })
  fechaIngreso?: string;
}
