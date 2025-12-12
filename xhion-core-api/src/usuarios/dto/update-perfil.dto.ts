import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsDateString, IsEnum, IsArray } from 'class-validator';
import { Genero, EstadoCivil } from '@prisma/client';

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
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  fechaNacimiento?: string;

  @ApiPropertyOptional({
    description: 'Fecha de ingreso del usuario a la empresa',
    example: '2020-01-10T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de ingreso debe ser una fecha válida' })
  fechaIngreso?: string;

  // === Personal Information Fields ===

  @ApiPropertyOptional({
    description: 'Dirección de residencia del usuario',
    example: 'Av. Javier Prado 2020, San Isidro',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  direccionResidencia?: string;

  @ApiPropertyOptional({
    description: 'Ciudad de residencia del usuario',
    example: 'Lima',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  ciudadResidencia?: string;

  @ApiPropertyOptional({
    description: 'País de residencia del usuario',
    example: 'Perú',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El país debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El país no puede exceder 100 caracteres' })
  paisResidencia?: string;

  @ApiPropertyOptional({
    description: 'Género del usuario',
    enum: Genero,
    example: 'Masculino',
  })
  @IsOptional()
  @IsEnum(Genero, { message: 'El género debe ser uno de: Masculino, Femenino, Otro, Prefiero_No_Decir' })
  genero?: Genero;

  @ApiPropertyOptional({
    description: 'Estado civil del usuario',
    enum: EstadoCivil,
    example: 'Soltero',
  })
  @IsOptional()
  @IsEnum(EstadoCivil, { message: 'El estado civil debe ser uno de: Soltero, Casado, Divorciado, Viudo, Union_Libre, Prefiero_No_Decir' })
  estadoCivil?: EstadoCivil;

  @ApiPropertyOptional({
    description: 'Nacionalidad del usuario',
    example: 'Peruana',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La nacionalidad debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La nacionalidad no puede exceder 100 caracteres' })
  nacionalidad?: string;

  // === Professional Extension Fields ===

  @ApiPropertyOptional({
    description: 'Título académico del usuario',
    example: 'Ingeniero de Sistemas',
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'El título académico debe ser una cadena de texto' })
  @MaxLength(150, { message: 'El título académico no puede exceder 150 caracteres' })
  tituloAcademico?: string;

  @ApiPropertyOptional({
    description: 'Institución educativa donde obtuvo el título',
    example: 'Universidad Nacional de Ingeniería',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'La institución educativa debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La institución educativa no puede exceder 200 caracteres' })
  institucionEducativa?: string;

  @ApiPropertyOptional({
    description: 'Lista de certificaciones profesionales',
    example: ['AWS Solutions Architect', 'Scrum Master'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las certificaciones deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada certificación debe ser una cadena de texto' })
  certificaciones?: string[];
}
