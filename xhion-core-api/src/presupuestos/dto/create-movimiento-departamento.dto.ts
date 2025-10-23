import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoMovimientoPresupuesto } from '@prisma/client';

export class CreateMovimientoDepartamentoDto {
  @ApiProperty({ description: 'ID del presupuesto del departamento' })
  @IsNotEmpty()
  @IsString()
  presupuestoDepartamentoId: string;

  @ApiProperty({ description: 'Tipo de movimiento', enum: TipoMovimientoPresupuesto })
  @IsNotEmpty()
  @IsEnum(TipoMovimientoPresupuesto)
  tipo: TipoMovimientoPresupuesto;

  @ApiProperty({ description: 'Monto del movimiento', example: 5000.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monto: number;

  @ApiProperty({ description: 'Descripción del movimiento' })
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({ description: 'Categoría del gasto', example: 'Salarios' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ description: 'URL o referencia del comprobante' })
  @IsOptional()
  @IsString()
  comprobante?: string;

  @ApiPropertyOptional({ description: 'ID del archivo comprobante' })
  @IsOptional()
  @IsString()
  archivoId?: string;

  @ApiPropertyOptional({ description: 'Fecha del movimiento' })
  @IsOptional()
  @IsDateString()
  fechaMovimiento?: string;
}
