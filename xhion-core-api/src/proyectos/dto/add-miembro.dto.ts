import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum RolProyecto {
  Responsable = 'Responsable',
  Miembro = 'Miembro',
  Observador = 'Observador',
}

export class AddMiembroDto {
  @ApiProperty({
    description: 'ID del usuario a agregar como miembro',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El usuarioId debe ser un UUID válido' })
  usuarioId: string;

  @ApiPropertyOptional({
    description: 'Rol del miembro en el proyecto',
    enum: RolProyecto,
    example: RolProyecto.Miembro,
    default: RolProyecto.Miembro,
  })
  @IsOptional()
  @IsEnum(RolProyecto, { message: 'El rol debe ser un valor válido' })
  rol?: RolProyecto;
}
