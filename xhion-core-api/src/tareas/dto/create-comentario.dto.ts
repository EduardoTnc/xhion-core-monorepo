import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComentarioDto {
  @ApiProperty({
    description: 'Contenido del comentario',
    example: 'He revisado los requisitos y están claros. Comenzaré con la implementación.',
    minLength: 1,
  })
  @IsString()
  @MinLength(1, { message: 'El contenido no puede estar vacío' })
  contenido: string;
}
