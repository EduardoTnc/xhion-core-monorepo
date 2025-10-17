import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * GET /api/v1/usuarios
   * Obtiene todos los usuarios del sistema con sus roles
   * Requiere rol: Admin o ProjectManager
   */
  @Get()
  @Roles('Admin', 'ProjectManager')
  async obtenerTodosLosUsuarios() {
    return this.usuariosService.obtenerTodosLosUsuarios();
  }

  /**
   * GET /api/v1/usuarios/:id
   * Obtiene un usuario específico por ID
   * Requiere rol: Admin o ProjectManager
   */
  @Get(':id')
  @Roles('Admin', 'ProjectManager')
  async obtenerUsuarioPorId(@Param('id') id: string) {
    const usuario = await this.usuariosService.obtenerUsuarioPorId(id);
    
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }
}
