import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { TipoMovimientoPresupuesto } from '@prisma/client';

export class RegistrarMovimientoPresupuestoDto {
  @ApiProperty({ enum: TipoMovimientoPresupuesto, example: TipoMovimientoPresupuesto.Gasto })
  @IsEnum(TipoMovimientoPresupuesto)
  tipo: TipoMovimientoPresupuesto;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @Min(0.01)
  monto: number;

  @ApiProperty({ example: 'Pago de servicios mensuales' })
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({ example: 'Categoría: Servicios' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ example: 'https://example.com/comprobante.pdf' })
  @IsOptional()
  @IsString()
  comprobante?: string;
}
