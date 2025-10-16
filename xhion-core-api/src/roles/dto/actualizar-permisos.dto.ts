import { IsArray, IsString } from 'class-validator';

/**
 * DTO para actualizar los permisos de un rol
 */
export class ActualizarPermisosDto {
  @IsArray()
  @IsString({ each: true })
  permisosIds: string[]; // Array de IDs de permisos a asignar al rol
}
