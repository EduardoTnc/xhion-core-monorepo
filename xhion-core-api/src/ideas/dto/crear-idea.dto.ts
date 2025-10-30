import { IsString, IsEnum, IsOptional, IsArray, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaIdea } from '@prisma/client';

export class CrearIdeaDto {
  @ApiProperty({ description: 'Título de la idea', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  titulo: string;

  @ApiProperty({ description: 'Descripción detallada de la idea' })
  @IsString()
  descripcion: string;

  @ApiProperty({ enum: CategoriaIdea, description: 'Categoría de la idea' })
  @IsEnum(CategoriaIdea)
  categoria: CategoriaIdea;

  @ApiPropertyOptional({ description: 'Score de IA (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  aiScore?: number;

  @ApiPropertyOptional({ description: 'Insight generado por IA' })
  @IsOptional()
  @IsString()
  aiInsight?: string;

  @ApiPropertyOptional({ description: 'Tags de la idea', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
