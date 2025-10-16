import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar qué roles pueden acceder a un endpoint
 * @param roles - Array de nombres de roles permitidos
 * @example @Roles('Admin', 'ProjectManager')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
