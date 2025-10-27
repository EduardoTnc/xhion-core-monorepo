import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para especificar permisos requeridos en un endpoint
 * 
 * Este decorator se usa en conjunto con el PermissionsGuard para
 * validar que el usuario tenga los permisos necesarios.
 * 
 * @param permissions - Lista de permisos requeridos (el usuario debe tener TODOS)
 * 
 * @example
 * // Requiere un solo permiso
 * @RequiresPermission('proyectos.crear')
 * async createProject() { ... }
 * 
 * @example
 * // Requiere múltiples permisos (AND)
 * @RequiresPermission('proyectos.editar', 'proyectos.gestionar_miembros')
 * async updateProject() { ... }
 * 
 * @example
 * // Uso completo en un controller
 * @Controller('proyectos')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * export class ProyectosController {
 *   @Post()
 *   @RequiresPermission('proyectos.crear')
 *   async create(@Body() dto: CreateProyectoDto) {
 *     return this.proyectosService.create(dto);
 *   }
 * 
 *   @Patch(':id')
 *   @RequiresPermission('proyectos.editar')
 *   async update(@Param('id') id: string, @Body() dto: UpdateProyectoDto) {
 *     return this.proyectosService.update(id, dto);
 *   }
 * 
 *   @Delete(':id')
 *   @RequiresPermission('proyectos.eliminar')
 *   async remove(@Param('id') id: string) {
 *     return this.proyectosService.remove(id);
 *   }
 * }
 */
export const RequiresPermission = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

/**
 * Decorator alternativo para endpoints públicos
 * Útil cuando un controller tiene PermissionsGuard global
 * pero algunos endpoints deben ser públicos
 * 
 * @example
 * @Controller('proyectos')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * export class ProyectosController {
 *   @Get('public')
 *   @PublicEndpoint()
 *   async getPublicProjects() {
 *     return this.proyectosService.findPublic();
 *   }
 * }
 */
export const PublicEndpoint = () => SetMetadata('permissions', []);
