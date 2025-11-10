import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsUUID, IsOptional, IsDateString, IsString, Min } from 'class-validator';

export class AsignarRecursoDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  departamentoId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  proyectoId?: string;

  @ApiProperty({ example: '2024-11-10' })
  @IsDateString()
  fechaInicio: string;

  @ApiPropertyOptional({ example: '2025-11-10' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ example: 'Para desarrollo del proyecto X' })
  @IsOptional()
  @IsString()
  proposito?: string;

  @ApiPropertyOptional({ example: 'Renovación anual automática' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
