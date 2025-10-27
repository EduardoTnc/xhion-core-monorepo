import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { ActualizarPermisosDto, CrearRolDto, ActualizarRolDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';

/**
 * Controlador para la gestión de roles y permisos
 * Todos los endpoints requieren autenticación
 * Los endpoints de escritura requieren rol de Admin
 */
@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * GET /api/v1/roles
   * Obtiene todos los roles con el conteo de usuarios
   */
  @Get()
  @RequiresPermission('roles.ver')
  findAll() {
    return this.rolesService.findAll();
  }

  /**
   * GET /api/v1/roles/with-details
   * Obtiene todos los roles con sus permisos completos (Eager Loading)
   * Optimizado para carga inicial - una sola petición
   */
  @Get('with-details')
  @RequiresPermission('roles.ver')
  findAllWithDetails() {
    return this.rolesService.findAllWithDetails();
  }

  /**
   * GET /api/v1/roles/usuarios/all
   * Obtiene todos los usuarios con información simplificada (Eager Loading)
   * Optimizado para carga inicial - sin paginación
   */
  @Get('usuarios/all')
  @RequiresPermission('usuarios.ver')
  findAllUsersSimple() {
    return this.rolesService.findAllUsersSimple();
  }

  /**
   * GET /api/v1/roles/:id
   * Obtiene un rol específico con todos sus permisos
   */
  @Get(':id')
  @RequiresPermission('roles.ver')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }


  /**
   * PATCH /api/v1/roles/:id/permisos
   * Actualiza los permisos de un rol
   * Solo accesible por usuarios con rol Admin
   */
  @Patch(':id/permisos')
  @RequiresPermission('roles.asignar_permisos')
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: ActualizarPermisosDto,
  ) {
    return this.rolesService.updatePermissions(id, dto);
  }

  /**
   * GET /api/v1/roles/permisos/all
   * Obtiene todos los permisos disponibles en el sistema
   */
  @Get('permisos/all')
  @RequiresPermission('roles.ver')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  /**
   * POST /api/v1/roles
   * Crea un nuevo rol
   * Solo accesible por usuarios con rol Admin
   */
  @Post()
  @RequiresPermission('roles.crear')
  create(@Body() dto: CrearRolDto) {
    return this.rolesService.create(dto);
  }

  /**
   * PATCH /api/v1/roles/:id
   * Actualiza un rol existente
   * Solo accesible por usuarios con rol Admin
   */
  @Patch(':id')
  @RequiresPermission('roles.editar')
  update(@Param('id') id: string, @Body() dto: ActualizarRolDto) {
    return this.rolesService.update(id, dto);
  }

  /**
   * DELETE /api/v1/roles/:id
   * Elimina un rol (eliminación lógica)
   * Solo accesible por usuarios con rol Admin
   */
  @Delete(':id')
  @RequiresPermission('roles.eliminar')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
