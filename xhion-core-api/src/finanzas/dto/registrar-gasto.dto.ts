import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsDateString, IsOptional, IsUUID, Min, MaxLength } from 'class-validator';
import { CategoriaGasto } from '@prisma/client';

export class RegistrarGastoDto {
  @ApiProperty({ enum: CategoriaGasto, example: CategoriaGasto.Software })
  @IsEnum(CategoriaGasto)
  categoria: CategoriaGasto;

  @ApiProperty({ example: 'Licencias de Notion Pro para el equipo' })
  @IsString()
  @MaxLength(200)
  concepto: string;

  @ApiProperty({ example: 1205.50 })
  @IsNumber()
  @Min(0.01)
  monto: number;

  @ApiProperty({ example: '2024-11-09' })
  @IsDateString()
  fechaGasto: string;

  @ApiPropertyOptional({ example: 'FAC-2024-005678' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  comprobante?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  recursoId?: string;
}
