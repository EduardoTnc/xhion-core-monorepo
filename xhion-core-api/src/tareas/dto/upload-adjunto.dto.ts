import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadAdjuntoDto {
  @ApiPropertyOptional({ description: 'Descripción breve o etiqueta del archivo adjunto' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  descripcion?: string;
}
