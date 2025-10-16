import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO para crear un nuevo rol
 */
export class CrearRolDto {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^(bg-|#)/, { message: 'El color debe ser una clase Tailwind (bg-*) o código hexadecimal (#)' })
  color?: string;
}
