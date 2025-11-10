import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, MaxLength, IsObject } from 'class-validator';
import { TipoNotificacion } from '@prisma/client';

export class CreateNotificacionDto {
  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Nueva tarea asignada',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'Se te ha asignado la tarea "Implementar módulo de calendario"',
  })
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    enum: TipoNotificacion,
    example: TipoNotificacion.Tarea,
  })
  @IsEnum(TipoNotificacion)
  tipo: TipoNotificacion;

  @ApiProperty({
    description: 'ID del usuario destinatario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  usuarioId: string;

  @ApiPropertyOptional({
    description: 'ID del proyecto relacionado',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  proyectoId?: string;

  @ApiPropertyOptional({
    description: 'ID de la tarea relacionada',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsOptional()
  tareaId?: string;

  @ApiPropertyOptional({
    description: 'ID del evento relacionado',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsUUID()
  @IsOptional()
  eventoId?: string;

  @ApiPropertyOptional({
    description: 'Metadata adicional en formato JSON',
    example: { accion: 'ver_tarea', prioridad: 'alta' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'URL de acción',
    example: '/proyectos/123/tareas/456',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  url?: string;
}
