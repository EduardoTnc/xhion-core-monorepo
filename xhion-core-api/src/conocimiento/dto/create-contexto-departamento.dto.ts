import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateContextoDepartamentoDto {
  @ApiProperty({
    description: 'ID del departamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  departamentoId: string;

  @ApiPropertyOptional({
    description: 'Funciones principales del departamento',
    example: 'Desarrollo de software, mantenimiento de sistemas, soporte técnico',
  })
  @IsOptional()
  @IsString()
  funciones?: string;

  @ApiPropertyOptional({
    description: 'Responsabilidades del departamento',
    example: 'Garantizar la calidad del código, cumplir con los plazos de entrega',
  })
  @IsOptional()
  @IsString()
  responsabilidades?: string;

  @ApiPropertyOptional({
    description: 'Procesos clave del departamento',
    example: 'Sprint planning, code review, deployment, testing',
  })
  @IsOptional()
  @IsString()
  procesosClave?: string;

  @ApiPropertyOptional({
    description: 'Objetivos del departamento',
    example: 'Reducir bugs en producción en un 40%, mejorar tiempo de respuesta',
  })
  @IsOptional()
  @IsString()
  objetivos?: string;

  @ApiPropertyOptional({
    description: 'KPIs del departamento',
    example: 'Velocidad de sprint, tasa de bugs, tiempo de resolución, cobertura de tests',
  })
  @IsOptional()
  @IsString()
  kpis?: string;
}
