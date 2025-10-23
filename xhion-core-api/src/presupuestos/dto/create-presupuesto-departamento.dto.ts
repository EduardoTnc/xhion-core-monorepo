import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPresupuesto } from '@prisma/client';

export class CreatePresupuestoDepartamentoDto {
  @ApiProperty({ description: 'ID del departamento' })
  @IsNotEmpty()
  @IsString()
  departamentoId: string;

  @ApiProperty({ description: 'Monto total del presupuesto', example: 50000.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  montoTotal: number;

  @ApiProperty({ description: 'Periodo del presupuesto', example: '2025-Q1' })
  @IsNotEmpty()
  @IsString()
  periodo: string;

  @ApiProperty({ description: 'Fecha de inicio del presupuesto' })
  @IsNotEmpty()
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ description: 'Fecha de fin del presupuesto' })
  @IsNotEmpty()
  @IsDateString()
  fechaFin: string;

  @ApiPropertyOptional({ description: 'Estado del presupuesto', enum: EstadoPresupuesto })
  @IsOptional()
  @IsEnum(EstadoPresupuesto)
  estado?: EstadoPresupuesto;

  @ApiPropertyOptional({ description: 'Descripción del presupuesto' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
