import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsDateString,
  IsUrl,
} from 'class-validator';

/**
 * DTO para que el usuario invitado acepte la invitación y complete su registro
 */
export class AceptarInvitacionDto {
  @ApiProperty({
    description: 'Token de invitación',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  token: string;

  @ApiProperty({
    description: 'Contraseña del nuevo usuario',
    example: 'MiContraseñaSegura123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiPropertyOptional({
    description: 'URL del avatar del usuario',
    example: 'https://ejemplo.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del avatar no es válida' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del usuario',
    example: '1990-01-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento?: string;

  @ApiPropertyOptional({
    description: 'Biografía del usuario',
    example: 'Desarrollador full-stack con 5 años de experiencia',
  })
  @IsOptional()
  @IsString()
  biografia?: string;
}

/**
 * DTO para que el administrador complete el registro del usuario invitado
 */
export class CompletarRegistroPorAdminDto {
  @ApiProperty({
    description: 'Token de invitación',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  token: string;

  @ApiProperty({
    description: 'Contraseña del nuevo usuario',
    example: 'MiContraseñaSegura123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiPropertyOptional({
    description: 'URL del avatar del usuario',
    example: 'https://ejemplo.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del avatar no es válida' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del usuario',
    example: '1990-01-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento?: string;

  @ApiPropertyOptional({
    description: 'Fecha de ingreso del usuario',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de ingreso no es válida' })
  fechaIngreso?: string;

  @ApiPropertyOptional({
    description: 'Biografía del usuario',
    example: 'Desarrollador full-stack con 5 años de experiencia',
  })
  @IsOptional()
  @IsString()
  biografia?: string;
}
