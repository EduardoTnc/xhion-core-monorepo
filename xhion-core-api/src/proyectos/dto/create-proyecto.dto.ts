import { IsString, IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProyectoDto {
  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Rediseño de la plataforma web',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del proyecto',
    example: 'Modernizar la interfaz de usuario y mejorar la experiencia del cliente',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'ID del usuario responsable del proyecto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El responsableId debe ser un UUID válido' })
  responsableId: string;

  @ApiPropertyOptional({
    description: 'ID del departamento al que pertenece el proyecto',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El departamentoId debe ser un UUID válido' })
  departamentoId?: string;
}
