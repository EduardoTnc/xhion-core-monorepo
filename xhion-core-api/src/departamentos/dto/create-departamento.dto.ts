import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateDepartamentoDto {
  @ApiProperty({
    description: 'Nombre del departamento',
    example: 'Desarrollo de Software',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del departamento',
    example: 'Departamento encargado del desarrollo y mantenimiento de aplicaciones',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Objetivos del departamento',
    example: 'Desarrollar aplicaciones de alta calidad, mantener la infraestructura tecnológica y liderar la innovación digital',
  })
  @IsOptional()
  @IsString()
  objetivos?: string;

  @ApiPropertyOptional({
    description: 'Nombre del icono de lucide-react para el departamento',
    example: 'Code',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icono?: string;

  @ApiPropertyOptional({
    description: 'Color del departamento (clase Tailwind o hex)',
    example: 'bg-blue-500',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional({
    description: 'ID del jefe del departamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  jefeId?: string;
}
