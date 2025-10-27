import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para asignar un rol a un usuario
 */
export class AsignarRolDto {
  @ApiProperty({
    description: 'ID del rol a asignar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  @IsString({ message: 'El ID del rol debe ser una cadena de texto' })
  @IsUUID('4', { message: 'El ID del rol debe ser un UUID válido' })
  rolId: string;
}
