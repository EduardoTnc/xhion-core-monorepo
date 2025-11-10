import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, IsOptional, IsEnum, Min } from 'class-validator';
import { EstadoPresupuesto } from '@prisma/client';

export class CreatePresupuestoDepartamentoDto {
  @ApiProperty({ example: 50000.00 })
  @IsNumber()
  @Min(0.01)
  montoTotal: number;

  @ApiProperty({ example: '2024-Q1' })
  @IsString()
  periodo: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: '2024-03-31' })
  @IsDateString()
  fechaFin: string;

  @ApiPropertyOptional({ example: 'Presupuesto trimestral para operaciones' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ enum: EstadoPresupuesto, example: EstadoPresupuesto.Activo })
  @IsOptional()
  @IsEnum(EstadoPresupuesto)
  estado?: EstadoPresupuesto;
}
