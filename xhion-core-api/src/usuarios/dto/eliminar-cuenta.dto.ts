import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class EliminarCuentaDto {
  @ApiProperty({
    description: 'Contraseña del usuario para confirmar la eliminación',
    example: 'Password123!',
  })
  @IsNotEmpty({ message: 'La contraseña es requerida para eliminar la cuenta' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;
}
