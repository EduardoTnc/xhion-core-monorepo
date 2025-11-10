import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { TipoRecurso, UnidadMedida } from '@prisma/client';

export class CreateRecursoDto {
  @ApiProperty({ example: 'Licencia Notion Pro' })
  @IsString()
  @MaxLength(200)
  nombre: string;

  @ApiPropertyOptional({ example: 'Licencia anual de Notion para el equipo' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ enum: TipoRecurso, example: TipoRecurso.Software })
  @IsEnum(TipoRecurso)
  tipo: TipoRecurso;

  @ApiPropertyOptional({ example: 'Licencia SaaS' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;

  @ApiProperty({ enum: UnidadMedida, example: UnidadMedida.Licencia })
  @IsEnum(UnidadMedida)
  unidadMedida: UnidadMedida;

  @ApiPropertyOptional({ example: 120.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costoUnitario?: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  stockActual: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockMinimo?: number;

  @ApiPropertyOptional({ example: 'Notion Labs' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  proveedor?: string;

  @ApiPropertyOptional({ example: 'SN-12345-ABCDE' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroSerie?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  fechaAdquisicion?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  vidaUtilMeses?: number;

  @ApiPropertyOptional({ example: 'Oficina Principal - Rack 3' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ubicacionFisica?: string;
}
