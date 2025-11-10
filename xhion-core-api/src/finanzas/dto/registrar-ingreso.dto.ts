import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsDateString, IsOptional, Min, MaxLength } from 'class-validator';
import { FuenteIngreso } from '@prisma/client';

export class RegistrarIngresoDto {
  @ApiProperty({ enum: FuenteIngreso, example: FuenteIngreso.Servicios })
  @IsEnum(FuenteIngreso)
  fuente: FuenteIngreso;

  @ApiProperty({ example: 15000.50 })
  @IsNumber()
  @Min(0.01)
  monto: number;

  @ApiPropertyOptional({ example: 'Pago por desarrollo de módulo de finanzas' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({ example: '2024-11-09' })
  @IsDateString()
  fechaIngreso: string;

  @ApiPropertyOptional({ example: 'FAC-2024-001234' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  comprobante?: string;
}
