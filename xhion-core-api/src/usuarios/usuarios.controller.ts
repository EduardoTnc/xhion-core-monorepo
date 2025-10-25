import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * GET /api/v1/usuarios
   * Obtiene todos los usuarios del sistema con sus roles
   * Requiere rol: Admin o Gerente
   */
  @Get()
  @Roles('Admin', 'Gerente')
  async obtenerTodosLosUsuarios() {
    return this.usuariosService.obtenerTodosLosUsuarios();
  }

  /**
   * GET /api/v1/usuarios/:id
   * Obtiene un usuario específico por ID
   * Requiere rol: Admin o Gerente
   */
  @Get(':id')
  @Roles('Admin', 'Gerente')
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
   * Requiere rol: Administrador
   */
  @Post(':id/asignar-puesto')
  @Roles('Administrador')
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
   * Requiere rol: Administrador
   */
  @Delete(':id/remover-puesto')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Remover puesto de trabajo de usuario' })
  @ApiResponse({ status: 200, description: 'Puesto removido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async removerPuestoTrabajo(@Param('id') usuarioId: string) {
    return this.usuariosService.removerPuestoTrabajo(usuarioId);
  }

  /**
   * GET /api/v1/usuarios/sin-puesto/disponibles
   * Obtiene usuarios sin puesto de trabajo asignado
   * Requiere rol: Administrador
   */
  @Get('sin-puesto/disponibles')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Obtener usuarios sin puesto asignado' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios sin puesto' })
  async obtenerUsuariosSinPuesto() {
    return this.usuariosService.obtenerUsuariosSinPuesto();
  }
}
