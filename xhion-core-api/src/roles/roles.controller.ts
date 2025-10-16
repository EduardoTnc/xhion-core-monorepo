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
import { RolesService } from './roles.service';
import { ActualizarPermisosDto, CrearRolDto, ActualizarRolDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

/**
 * Controlador para la gestión de roles y permisos
 * Todos los endpoints requieren autenticación
 * Los endpoints de escritura requieren rol de Admin
 */
@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * GET /api/v1/roles
   * Obtiene todos los roles con el conteo de usuarios
   */
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  /**
   * GET /api/v1/roles/with-details
   * Obtiene todos los roles con sus permisos completos (Eager Loading)
   * Optimizado para carga inicial - una sola petición
   */
  @Get('with-details')
  findAllWithDetails() {
    return this.rolesService.findAllWithDetails();
  }

  /**
   * GET /api/v1/roles/:id
   * Obtiene un rol específico con todos sus permisos
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  /**
   * GET /api/v1/roles/:id/usuarios
   * Obtiene los usuarios que tienen asignado un rol específico
   * Soporta paginación con query params: page y limit
   */
  @Get(':id/usuarios')
  findUsersByRole(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.rolesService.findUsersByRole(id, page, limit);
  }

  /**
   * PATCH /api/v1/roles/:id/permisos
   * Actualiza los permisos de un rol
   * Solo accesible por usuarios con rol Admin
   */
  @Patch(':id/permisos')
  @UseGuards(RolesGuard)
  @Roles('Admin')
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
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  /**
   * POST /api/v1/roles
   * Crea un nuevo rol
   * Solo accesible por usuarios con rol Admin
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('Admin')
  create(@Body() dto: CrearRolDto) {
    return this.rolesService.create(dto);
  }

  /**
   * PATCH /api/v1/roles/:id
   * Actualiza un rol existente
   * Solo accesible por usuarios con rol Admin
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  update(@Param('id') id: string, @Body() dto: ActualizarRolDto) {
    return this.rolesService.update(id, dto);
  }

  /**
   * DELETE /api/v1/roles/:id
   * Elimina un rol (eliminación lógica)
   * Solo accesible por usuarios con rol Admin
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
