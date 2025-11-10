import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MaxLength, IsOptional, Matches } from 'class-validator';

export class CreateSolicitudDto {
  @ApiProperty({
    description: 'Nombre completo del solicitante',
    example: 'Juan Pérez García',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @MaxLength(200)
  nombreCompleto: string;

  @ApiProperty({
    description: 'Email del solicitante',
    example: 'juan.perez@empresa.com',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+51 987 654 321',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Nombre de la empresa',
    example: 'Empresa SAC',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  empresa?: string;

  @ApiPropertyOptional({
    description: 'Cargo o posición',
    example: 'Desarrollador Full Stack',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargo?: string;

  @ApiPropertyOptional({
    description: 'Mensaje o motivo de la solicitud',
    example: 'Me gustaría unirme al equipo de desarrollo...',
  })
  @IsString()
  @IsOptional()
  mensaje?: string;
}
