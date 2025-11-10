import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TipoMovimiento } from '@prisma/client';

export class RegistrarMovimientoDto {
  @ApiProperty({ enum: TipoMovimiento, example: TipoMovimiento.Entrada })
  @IsEnum(TipoMovimiento)
  tipo: TipoMovimiento;

  @ApiProperty({ example: 10 })
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

  @ApiPropertyOptional({ example: 'Compra de licencias adicionales' })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiPropertyOptional({ example: 1205.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costoTotal?: number;

  @ApiPropertyOptional({ example: 'FAC-2024-001234' })
  @IsOptional()
  @IsString()
  documentoReferencia?: string;
}
