import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CambiarContrasenaDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'Password123!',
  })
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
  currentPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario',
    example: 'NewPassword456!',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  newPassword: string;
}
