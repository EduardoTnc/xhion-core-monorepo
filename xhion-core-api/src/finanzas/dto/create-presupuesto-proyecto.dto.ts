import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { EstadoPresupuesto } from '@prisma/client';

export class CreatePresupuestoProyectoDto {
  @ApiProperty({ example: 25000.00 })
  @IsNumber()
  @Min(0.01)
  montoTotal: number;

  @ApiPropertyOptional({ example: 'Presupuesto anual del proyecto' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ enum: EstadoPresupuesto, example: EstadoPresupuesto.Activo })
  @IsOptional()
  @IsEnum(EstadoPresupuesto)
  estado?: EstadoPresupuesto;
}
