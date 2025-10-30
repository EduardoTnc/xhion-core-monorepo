import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdatePreferenciasDto {
  @ApiPropertyOptional({
    description: 'Tema de la aplicación',
    example: 'dark',
    enum: ['light', 'dark', 'system'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark', 'system'], { message: 'El tema debe ser light, dark o system' })
  theme?: string;

  @ApiPropertyOptional({
    description: 'Color de acento',
    example: 'blue',
    enum: ['blue', 'purple', 'green', 'orange'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['blue', 'purple', 'green', 'orange'], { message: 'El color de acento debe ser blue, purple, green u orange' })
  accentColor?: string;

  @ApiPropertyOptional({
    description: 'Densidad de la interfaz',
    example: 'comfortable',
    enum: ['compact', 'comfortable', 'spacious'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['compact', 'comfortable', 'spacious'], { message: 'La densidad debe ser compact, comfortable o spacious' })
  density?: string;

  @ApiPropertyOptional({
    description: 'Idioma de la aplicación',
    example: 'es',
    enum: ['es', 'en', 'pt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['es', 'en', 'pt'], { message: 'El idioma debe ser es, en o pt' })
  language?: string;

  @ApiPropertyOptional({
    description: 'Zona horaria',
    example: 'America/Mexico_City',
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}
