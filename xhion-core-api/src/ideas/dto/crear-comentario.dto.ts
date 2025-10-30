import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearComentarioDto {
  @ApiProperty({ description: 'Contenido del comentario' })
  @IsString()
  @IsNotEmpty()
  contenido: string;
}
