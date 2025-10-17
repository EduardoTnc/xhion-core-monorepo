import { IsNotEmpty, IsString, MinLength, IsOptional, IsDateString, IsUrl } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  // Campos opcionales del perfil
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  biografia?: string;
}
