import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPresupuesto } from '@prisma/client';

export class CreatePresupuestoProyectoDto {
  @ApiProperty({ description: 'ID del proyecto' })
  @IsNotEmpty()
  @IsString()
  proyectoId: string;

  @ApiProperty({ description: 'Monto total del presupuesto', example: 100000.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  montoTotal: number;

  @ApiPropertyOptional({ description: 'Estado del presupuesto', enum: EstadoPresupuesto })
  @IsOptional()
  @IsEnum(EstadoPresupuesto)
  estado?: EstadoPresupuesto;

  @ApiPropertyOptional({ description: 'Descripción del presupuesto' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
