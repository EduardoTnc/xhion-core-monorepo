import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificacionesDto {
  @ApiPropertyOptional({
    description: 'Notificaciones por email',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo email debe ser un booleano' })
  email?: boolean;

  @ApiPropertyOptional({
    description: 'Notificaciones push en el navegador',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo push debe ser un booleano' })
  push?: boolean;

  @ApiPropertyOptional({
    description: 'Notificaciones de tareas asignadas',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo taskAssigned debe ser un booleano' })
  taskAssigned?: boolean;

  @ApiPropertyOptional({
    description: 'Notificaciones de menciones',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo mentions debe ser un booleano' })
  mentions?: boolean;

  @ApiPropertyOptional({
    description: 'Notificaciones de actualizaciones de proyectos',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo projectUpdates debe ser un booleano' })
  projectUpdates?: boolean;

  @ApiPropertyOptional({
    description: 'Resumen diario',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo dailySummary debe ser un booleano' })
  dailySummary?: boolean;
}
