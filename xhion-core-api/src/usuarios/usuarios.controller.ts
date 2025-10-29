import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Body,
  UseGuards,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AsignarRolDto } from './dto';

@ApiTags('Usuarios')
@ApiBearerAuth('JWT-auth')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * GET /api/v1/usuarios
   * Obtiene todos los usuarios del sistema con sus roles
   * Requiere permiso: usuarios.ver
   */
  @Get()
  @RequiresPermission('usuarios.ver')
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  async obtenerTodosLosUsuarios() {
    return this.usuariosService.obtenerTodosLosUsuarios();
  }

  /**
   * GET /api/v1/usuarios/sin-puesto/disponibles
   * Obtiene usuarios sin puesto de trabajo asignado
   * Requiere permiso: departamentos.gestionar_empleados
   * IMPORTANTE: Esta ruta debe estar ANTES de ':id' para evitar conflictos
   */
  @Get('sin-puesto/disponibles')
  @RequiresPermission('departamentos.gestionar_empleados')
  @ApiOperation({ summary: 'Obtener usuarios sin puesto asignado' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios sin puesto' })
  async obtenerUsuariosSinPuesto() {
    return this.usuariosService.obtenerUsuariosSinPuesto();
  }

  /**
   * GET /api/v1/usuarios/:id
   * Obtiene un usuario específico por ID
   * Requiere permiso: usuarios.ver
   */
  @Get(':id')
  @RequiresPermission('usuarios.ver')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async obtenerUsuarioPorId(@Param('id') id: string) {
    const usuario = await this.usuariosService.obtenerUsuarioPorId(id);
    
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  /**
   * POST /api/v1/usuarios/:id/asignar-puesto
   * Asigna un puesto de trabajo a un usuario
   * Requiere permiso: departamentos.gestionar_empleados
   */
  @Post(':id/asignar-puesto')
  @RequiresPermission('departamentos.gestionar_empleados')
  @ApiOperation({ summary: 'Asignar puesto de trabajo a usuario' })
  @ApiResponse({ status: 200, description: 'Puesto asignado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario o puesto no encontrado' })
  async asignarPuestoTrabajo(
    @Param('id') usuarioId: string,
    @Body('puestoTrabajoId') puestoTrabajoId: string,
  ) {
    return this.usuariosService.asignarPuestoTrabajo(usuarioId, puestoTrabajoId);
  }

  /**
   * DELETE /api/v1/usuarios/:id/remover-puesto
   * Remueve el puesto de trabajo de un usuario
   * Requiere permiso: departamentos.gestionar_empleados
   */
  @Delete(':id/remover-puesto')
  @RequiresPermission('departamentos.gestionar_empleados')
  @ApiOperation({ summary: 'Remover puesto de trabajo de usuario' })
  @ApiResponse({ status: 200, description: 'Puesto removido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async removerPuestoTrabajo(@Param('id') usuarioId: string) {
    return this.usuariosService.removerPuestoTrabajo(usuarioId);
  }

  /**
   * POST /api/v1/usuarios/:id/asignar-rol
   * Asigna un rol a un usuario
   * Requiere permiso: usuarios.gestionar_roles
   */
  @Post(':id/asignar-rol')
  @RequiresPermission('usuarios.gestionar_roles')
  @ApiOperation({ summary: 'Asignar rol a usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol asignado exitosamente',
    schema: {
      example: {
        message: 'Rol "Editor" asignado exitosamente al usuario Juan Pérez',
        usuario: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombreCompleto: 'Juan Pérez',
          email: 'juan@example.com',
          rolAnterior: 'Colaborador',
          rolNuevo: 'Editor',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  @ApiResponse({ status: 400, description: 'El rol está eliminado' })
  async asignarRol(
    @Param('id') usuarioId: string,
    @Body() dto: AsignarRolDto,
  ) {
    return this.usuariosService.asignarRol(usuarioId, dto.rolId);
  }

  /**
   * PATCH /api/v1/usuarios/:id/cambiar-rol
   * Cambia el rol de un usuario (alias de asignar-rol)
   * Requiere permiso: usuarios.gestionar_roles
   */
  @Patch(':id/cambiar-rol')
  @RequiresPermission('usuarios.gestionar_roles')
  @ApiOperation({ summary: 'Cambiar rol de usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Rol cambiado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  async cambiarRol(
    @Param('id') usuarioId: string,
    @Body() dto: AsignarRolDto,
  ) {
    return this.usuariosService.cambiarRol(usuarioId, dto.rolId);
  }

  /**
   * PATCH /api/v1/usuarios/:id/estado
   * Cambia el estado de un usuario (ACTIVO/INACTIVO)
   * Requiere permiso: usuarios.editar
   */
  @Patch(':id/estado')
  @RequiresPermission('usuarios.editar')
  @ApiOperation({ summary: 'Cambiar estado de usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado cambiado exitosamente',
    schema: {
      example: {
        message: 'Usuario "Juan Pérez" desactivado exitosamente',
        usuario: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombreCompleto: 'Juan Pérez',
          email: 'juan@example.com',
          estadoAnterior: 'ACTIVO',
          estadoNuevo: 'INACTIVO',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 400, description: 'Estado inválido' })
  async cambiarEstado(
    @Param('id') usuarioId: string,
    @Body('estado') estado: 'ACTIVO' | 'INACTIVO',
  ) {
    return this.usuariosService.cambiarEstado(usuarioId, estado);
  }

  /**
   * DELETE /api/v1/usuarios/:id
   * Elimina un usuario del sistema (eliminación lógica)
   * Requiere permiso: usuarios.eliminar
   */
  @Delete(':id')
  @RequiresPermission('usuarios.eliminar')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente',
    schema: {
      example: {
        message: 'Usuario "Juan Pérez" eliminado exitosamente',
        usuario: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombreCompleto: 'Juan Pérez',
          email: 'juan@example.com',
          eliminadoEn: '2025-10-28T23:47:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar el último administrador' })
  async eliminarUsuario(@Param('id') usuarioId: string) {
    return this.usuariosService.eliminarUsuario(usuarioId);
  }

  /**
   * GET /api/v1/usuarios/por-rol/:rolId
   * Obtiene todos los usuarios que tienen un rol específico
   * Requiere permiso: usuarios.ver
   */
  @Get('por-rol/:rolId')
  @RequiresPermission('usuarios.ver')
  @ApiOperation({ summary: 'Obtener usuarios por rol' })
  @ApiParam({ name: 'rolId', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios con el rol especificado',
    schema: {
      example: {
        rol: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombre: 'Editor',
          descripcion: 'Puede crear y editar contenido',
          color: 'bg-blue-500',
        },
        totalUsuarios: 5,
        usuarios: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            nombreCompleto: 'Juan Pérez',
            email: 'juan@example.com',
            avatarUrl: null,
            estado: 'ACTIVO',
            fechaIngreso: '2024-01-15T00:00:00.000Z',
            puesto: 'Desarrollador Senior',
            departamento: 'Tecnología',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async obtenerUsuariosPorRol(@Param('rolId') rolId: string) {
    return this.usuariosService.obtenerUsuariosPorRol(rolId);
  }

  /**
   * GET /api/v1/usuarios/estadisticas/por-rol
   * Obtiene estadísticas de usuarios por rol
   * Requiere permiso: sistema.ver_estadisticas
   */
  @Get('estadisticas/por-rol')
  @RequiresPermission('sistema.ver_estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de usuarios por rol' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de usuarios por rol',
    schema: {
      example: {
        totalUsuarios: 25,
        roles: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            nombre: 'Administrador',
            descripcion: 'Acceso total al sistema',
            color: 'bg-destructive',
            cantidadUsuarios: 2,
            porcentaje: '8.00',
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            nombre: 'Editor',
            descripcion: 'Puede crear y editar contenido',
            color: 'bg-blue-500',
            cantidadUsuarios: 10,
            porcentaje: '40.00',
          },
        ],
      },
    },
  })
  async obtenerEstadisticasPorRol() {
    return this.usuariosService.obtenerEstadisticasPorRol();
  }
}
