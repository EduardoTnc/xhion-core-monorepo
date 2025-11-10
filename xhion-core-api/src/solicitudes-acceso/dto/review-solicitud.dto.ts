import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { EstadoSolicitud } from '@prisma/client';

export class ReviewSolicitudDto {
  @ApiProperty({
    description: 'Nuevo estado de la solicitud',
    enum: EstadoSolicitud,
    example: EstadoSolicitud.Aprobada,
  })
  @IsEnum(EstadoSolicitud, { message: 'El estado debe ser válido' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  estado: EstadoSolicitud;

  @ApiPropertyOptional({
    description: 'Comentario del revisor',
    example: 'Solicitud aprobada. Bienvenido al equipo.',
  })
  @IsString()
  @IsOptional()
  comentarioRevision?: string;

  @ApiPropertyOptional({
    description: 'ID del rol a asignar (solo si se aprueba)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  rolId?: string;

  @ApiPropertyOptional({
    description: 'ID del departamento a asignar (solo si se aprueba)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  departamentoId?: string;
}
