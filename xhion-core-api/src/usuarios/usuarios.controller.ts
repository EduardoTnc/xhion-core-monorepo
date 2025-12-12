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
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AsignarRolDto, CreateContactoDto, UpdateContactoDto, CreateEnlaceProfesionalDto, UpdateEnlaceProfesionalDto } from './dto';

@ApiTags('Usuarios')
@ApiBearerAuth('JWT-auth')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

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

  // ==================== CONTACT CRUD ENDPOINTS ====================
  // IMPORTANTE: Estas rutas deben estar ANTES de ':id' para evitar conflictos

  /**
   * GET /api/v1/usuarios/contactos (current user's contacts)
   * Obtiene los contactos del usuario autenticado
   */
  @Get('contactos')
  @ApiOperation({ summary: 'Obtener contactos del usuario actual' })
  @ApiResponse({ status: 200, description: 'Lista de contactos' })
  async obtenerMisContactos(@Req() req: Request) {
    const user = req.user as any;
    return this.usuariosService.obtenerContactos(user.id);
  }

  /**
   * POST /api/v1/usuarios/contactos
   * Agregar un nuevo contacto para el usuario autenticado
   */
  @Post('contactos')
  @ApiOperation({ summary: 'Agregar contacto' })
  @ApiBody({ type: CreateContactoDto })
  @ApiResponse({ status: 201, description: 'Contacto creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async agregarContacto(@Req() req: Request, @Body() dto: CreateContactoDto) {
    const user = req.user as any;
    return this.usuariosService.agregarContacto(user.id, dto);
  }

  /**
   * PATCH /api/v1/usuarios/contactos/:id
   * Actualizar un contacto existente
   */
  @Patch('contactos/:id')
  @ApiOperation({ summary: 'Actualizar contacto' })
  @ApiParam({ name: 'id', description: 'ID del contacto' })
  @ApiBody({ type: UpdateContactoDto })
  @ApiResponse({ status: 200, description: 'Contacto actualizado' })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  async actualizarContacto(
    @Param('id') contactoId: string,
    @Req() req: Request,
    @Body() dto: UpdateContactoDto,
  ) {
    const user = req.user as any;
    return this.usuariosService.actualizarContacto(contactoId, user.id, dto);
  }

  /**
   * DELETE /api/v1/usuarios/contactos/:id
   * Eliminar un contacto
   */
  @Delete('contactos/:id')
  @ApiOperation({ summary: 'Eliminar contacto' })
  @ApiParam({ name: 'id', description: 'ID del contacto' })
  @ApiResponse({ status: 200, description: 'Contacto eliminado' })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  async eliminarContacto(@Param('id') contactoId: string, @Req() req: Request) {
    const user = req.user as any;
    return this.usuariosService.eliminarContacto(contactoId, user.id);
  }

  // ==================== PROFESSIONAL LINKS CRUD ENDPOINTS ====================
  // IMPORTANTE: Estas rutas deben estar ANTES de ':id' para evitar conflictos

  /**
   * GET /api/v1/usuarios/enlaces-profesionales
   * Obtiene los enlaces profesionales del usuario autenticado
   */
  @Get('enlaces-profesionales')
  @ApiOperation({ summary: 'Obtener enlaces profesionales del usuario actual' })
  @ApiResponse({ status: 200, description: 'Lista de enlaces profesionales' })
  async obtenerMisEnlacesProfesionales(@Req() req: Request) {
    const user = req.user as any;
    return this.usuariosService.obtenerEnlacesProfesionales(user.id);
  }

  /**
   * POST /api/v1/usuarios/enlaces-profesionales
   * Agregar un nuevo enlace profesional para el usuario autenticado
   */
  @Post('enlaces-profesionales')
  @ApiOperation({ summary: 'Agregar enlace profesional' })
  @ApiBody({ type: CreateEnlaceProfesionalDto })
  @ApiResponse({ status: 201, description: 'Enlace creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async agregarEnlaceProfesional(@Req() req: Request, @Body() dto: CreateEnlaceProfesionalDto) {
    const user = req.user as any;
    return this.usuariosService.agregarEnlaceProfesional(user.id, dto);
  }

  /**
   * PATCH /api/v1/usuarios/enlaces-profesionales/:id
   * Actualizar un enlace profesional existente
   */
  @Patch('enlaces-profesionales/:id')
  @ApiOperation({ summary: 'Actualizar enlace profesional' })
  @ApiParam({ name: 'id', description: 'ID del enlace' })
  @ApiBody({ type: UpdateEnlaceProfesionalDto })
  @ApiResponse({ status: 200, description: 'Enlace actualizado' })
  @ApiResponse({ status: 404, description: 'Enlace no encontrado' })
  async actualizarEnlaceProfesional(
    @Param('id') enlaceId: string,
    @Req() req: Request,
    @Body() dto: UpdateEnlaceProfesionalDto,
  ) {
    const user = req.user as any;
    return this.usuariosService.actualizarEnlaceProfesional(enlaceId, user.id, dto);
  }

  /**
   * DELETE /api/v1/usuarios/enlaces-profesionales/:id
   * Eliminar un enlace profesional
   */
  @Delete('enlaces-profesionales/:id')
  @ApiOperation({ summary: 'Eliminar enlace profesional' })
  @ApiParam({ name: 'id', description: 'ID del enlace' })
  @ApiResponse({ status: 200, description: 'Enlace eliminado' })
  @ApiResponse({ status: 404, description: 'Enlace no encontrado' })
  async eliminarEnlaceProfesional(@Param('id') enlaceId: string, @Req() req: Request) {
    const user = req.user as any;
    return this.usuariosService.eliminarEnlaceProfesional(enlaceId, user.id);
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

  /**
   * GET /api/v1/usuarios/:id/perfil-completo
   * Obtiene el perfil completo de un usuario incluyendo proyectos, tareas y perfil profesional
   * Requiere permiso: usuarios.ver
   */
  @Get(':id/perfil-completo')
  @RequiresPermission('usuarios.ver')
  @ApiOperation({ summary: 'Obtener perfil completo de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Perfil completo del usuario',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombreCompleto: 'Juan Pérez',
        email: 'juan@example.com',
        avatarUrl: null,
        biografia: 'Desarrollador con 5 años de experiencia',
        estado: 'ACTIVO',
        fechaIngreso: '2024-01-15',
        fechaNacimiento: '1990-05-20',
        archivoCvId: 'archivo-123',
        puntajePerfilCompleto: 85,
        rol: { id: 'rol-id', nombre: 'Editor', color: '#3B82F6' },
        puestoTrabajo: { titulo: 'Desarrollador Senior', descripcion: '...' },
        proyectos: {
          responsable: [],
          miembro: [],
          totalResponsable: 2,
          totalMiembro: 5,
        },
        tareas: {
          asignadas: [],
          totalAsignadas: 10,
          pendientes: 3,
          enProgreso: 2,
          completadas: 5,
        },
        perfilProfesional: {
          yearsExperience: '5-10',
          professionalLevel: 'senior',
          specializations: ['frontend', 'backend'],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async obtenerPerfilCompleto(@Param('id') usuarioId: string) {
    return this.usuariosService.obtenerPerfilCompleto(usuarioId);
  }

  /**
   * GET /api/v1/usuarios/:id/tareas-historial
   * Obtiene el historial de tareas de un usuario con paginación
   * Requiere permiso: usuarios.ver
   */
  @Get(':id/tareas-historial')
  @RequiresPermission('usuarios.ver')
  @ApiOperation({ summary: 'Obtener historial de tareas de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página', example: 10 })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado', enum: ['Por_Hacer', 'En_Progreso', 'Hecho', 'Bloqueado'] })
  @ApiResponse({
    status: 200,
    description: 'Historial de tareas del usuario',
    schema: {
      example: {
        data: [],
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async obtenerTareasHistorial(
    @Param('id') usuarioId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('estado') estado?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.usuariosService.obtenerTareasHistorial(usuarioId, pageNum, limitNum, estado);
  }

  /**
   * GET /api/v1/usuarios/:id/proyectos
   * Obtiene los proyectos de un usuario con paginación
   * Requiere permiso: usuarios.ver
   */
  @Get(':id/proyectos')
  @RequiresPermission('usuarios.ver')
  @ApiOperation({ summary: 'Obtener proyectos de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página', example: 10 })
  @ApiQuery({ name: 'rol', required: false, description: 'Filtrar por rol', enum: ['responsable', 'miembro', 'todos'] })
  @ApiResponse({
    status: 200,
    description: 'Proyectos del usuario',
    schema: {
      example: {
        data: [],
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async obtenerProyectosUsuario(
    @Param('id') usuarioId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('rol') rol: string = 'todos',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.usuariosService.obtenerProyectosUsuario(usuarioId, pageNum, limitNum, rol);
  }

  // ==================== USER IDEAS ENDPOINT ====================

  /**
   * GET /api/v1/usuarios/:id/ideas
   * Obtiene las ideas creadas y votadas por un usuario
   * Requiere permiso: usuarios.ver
   */
  @Get(':id/ideas')
  @RequiresPermission('usuarios.ver')
  @ApiOperation({ summary: 'Obtener ideas de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Ideas del usuario',
    schema: {
      example: {
        creadas: [],
        votadas: [],
        totalCreadas: 5,
        totalVotadas: 12,
        estadisticas: {
          pendientes: 2,
          aprobadas: 1,
          enDesarrollo: 1,
          implementadas: 1,
          rechazadas: 0,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async obtenerIdeasUsuario(@Param('id') usuarioId: string) {
    return this.usuariosService.obtenerIdeasUsuario(usuarioId);
  }

  // ==================== USER ACTIVITY ENDPOINT ====================

  /**
   * GET /api/v1/usuarios/:id/actividad
   * Obtiene el historial de actividad de un usuario
   * Requiere permiso: usuarios.ver
   */
  @Get(':id/actividad')
  @RequiresPermission('usuarios.ver')
  @ApiOperation({ summary: 'Obtener historial de actividad de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de registros', example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Actividad del usuario',
    schema: {
      example: {
        actividad: [],
        ultimoLogin: '2024-01-15T10:30:00Z',
        totalAcciones: 50,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async obtenerActividadUsuario(
    @Param('id') usuarioId: string,
    @Query('limit') limit: string = '50',
  ) {
    const limitNum = parseInt(limit, 10);
    return this.usuariosService.obtenerActividadUsuario(usuarioId, limitNum);
  }

  // ==================== USER ANALYTICS ENDPOINT ====================

  /**
   * GET /api/v1/usuarios/:id/analytics
   * Obtiene analytics avanzados de un usuario para Magnus IA
   * Requiere permiso: usuarios.ver
   */
  @Get(':id/analytics')
  @RequiresPermission('usuarios.ver')
  @ApiOperation({ summary: 'Obtener analytics de productividad de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Analytics del usuario',
    schema: {
      example: {
        productividad: {
          tareasCompletadasSemana: 5,
          tareasCompletadasSemanaAnterior: 3,
          tareasCompletadasMes: 15,
          tendencia: 66,
        },
        estadoActual: {
          tareasEnProgreso: 3,
          tareasPendientes: 5,
          tareasVencidas: 1,
          proyectosActivos: 4,
        },
        colaboracion: {
          comentariosSemana: 12,
        },
        cargaTrabajo: {
          total: 8,
          nivel: 'media',
        },
        perfil: {
          antiguedadMeses: 24,
          rol: 'Developer',
          departamento: 'Tecnología',
        },
        insights: [
          { tipo: 'success', texto: 'Productividad aumentó 66% esta semana' },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async obtenerAnalyticsUsuario(@Param('id') usuarioId: string) {
    return this.usuariosService.obtenerAnalyticsUsuario(usuarioId);
  }
}
