import { PartialType } from '@nestjs/mapped-types';
import { CrearRolDto } from './crear-rol.dto';

/**
 * DTO para actualizar un rol existente
 * Todos los campos son opcionales
 */
export class ActualizarRolDto extends PartialType(CrearRolDto) {}
