import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInvitacionDto {
  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

  @IsEmail()
  email: string;

  @IsUUID()
  rol_id: string;

  @IsOptional()
  @IsUUID()
  departamento_id?: string;

  @IsUUID()
  invitado_por_id: string;
}