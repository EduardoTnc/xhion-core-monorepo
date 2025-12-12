import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  StreamableFile,
  Header,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuariosService } from './usuarios.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { UpdatePreferenciasDto } from './dto/update-preferencias.dto';
import { UpdateNotificacionesDto } from './dto/update-notificaciones.dto';
import { UpdatePerfilProfesionalDto } from './dto/update-perfil-profesional.dto';
import { CambiarContrasenaDto } from '../auth/dto/cambiar-contrasena.dto';
import { EliminarCuentaDto } from './dto/eliminar-cuenta.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { createReadStream } from 'fs';
import { join } from 'path';

@ApiTags('Configuración de Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosConfiguracionController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly prisma: PrismaService,
  ) { }

  // ========== PERFIL ==========

  @Patch('perfil')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async updatePerfil(@Request() req, @Body() updatePerfilDto: UpdatePerfilDto) {
    const usuarioId = req.user.id;

    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ...(updatePerfilDto.nombreCompleto && { nombreCompleto: updatePerfilDto.nombreCompleto }),
        ...(updatePerfilDto.biografia !== undefined && { biografia: updatePerfilDto.biografia }),
        ...(updatePerfilDto.fechaNacimiento && { fechaNacimiento: new Date(updatePerfilDto.fechaNacimiento) }),
        ...(updatePerfilDto.fechaIngreso && { fechaIngreso: new Date(updatePerfilDto.fechaIngreso) }),
      },
      include: {
        rol: {
          include: {
            permisos: {
              include: {
                permiso: true,
              },
            },
          },
        },
        puestoTrabajo: true,
        supervisor: {
          select: {
            id: true,
            nombreCompleto: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Calcular puntaje del perfil
    const puntaje = this.calcularPuntajePerfil(usuarioActualizado);
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { puntajePerfilCompleto: puntaje },
    });

    return {
      id: usuarioActualizado.id,
      nombreCompleto: usuarioActualizado.nombreCompleto,
      email: usuarioActualizado.email,
      avatarUrl: usuarioActualizado.avatarUrl,
      biografia: usuarioActualizado.biografia,
      fechaNacimiento: usuarioActualizado.fechaNacimiento,
      fechaIngreso: usuarioActualizado.fechaIngreso,
      archivoCvId: usuarioActualizado.archivoCvId,
      rol: usuarioActualizado.rol.nombre,
      permisos: usuarioActualizado.rol.permisos.map((rp) => rp.permiso.nombreAccion),
      puestoTrabajo: usuarioActualizado.puestoTrabajo,
      supervisor: usuarioActualizado.supervisor,
      puntajePerfilCompleto: puntaje,
    };
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Subir avatar del usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar subido correctamente' })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Solo se permiten imágenes (JPG, PNG, GIF)'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    await this.prisma.usuario.update({
      where: { id: req.user.id },
      data: { avatarUrl },
    });

    return { avatarUrl };
  }

  @Post('cv')
  @ApiOperation({ summary: 'Subir CV del usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cv: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'CV subido correctamente' })
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: './uploads/cvs',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `cv-${uniqueSuffix}.pdf`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Solo se permiten archivos PDF'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadCv(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const cvUrl = `/uploads/cvs/${file.filename}`;

    // Crear registro de archivo en la BD
    const archivo = await this.prisma.archivo.create({
      data: {
        nombreArchivo: file.originalname,
        urlArchivo: cvUrl,
        tipoArchivo: file.mimetype,
        tamanoBytes: file.size,
        subidoPorId: req.user.id,
      },
    });

    await this.prisma.usuario.update({
      where: { id: req.user.id },
      data: { archivoCvId: archivo.id },
    });

    return { cvUrl };
  }

  // ========== PREFERENCIAS ==========

  @Get('preferencias')
  @ApiOperation({ summary: 'Obtener preferencias del usuario' })
  @ApiResponse({ status: 200, description: 'Preferencias obtenidas correctamente' })
  async getPreferencias(@Request() req) {
    const config = await this.prisma.configuracionUsuario.findFirst({
      where: { usuarioId: req.user.id },
    });

    if (!config || !config.preferencias) {
      return {
        theme: 'system',
        accentColor: 'blue',
        density: 'comfortable',
        language: 'es',
        timezone: 'America/Mexico_City',
      };
    }

    return config.preferencias;
  }

  @Patch('preferencias')
  @ApiOperation({ summary: 'Actualizar preferencias del usuario' })
  @ApiResponse({ status: 200, description: 'Preferencias actualizadas correctamente' })
  async updatePreferencias(@Request() req, @Body() updatePreferenciasDto: UpdatePreferenciasDto) {
    const usuarioId = req.user.id;

    // Obtener preferencias actuales
    let config = await this.prisma.configuracionUsuario.findFirst({
      where: { usuarioId },
    });

    const preferenciasActuales = (config?.preferencias as any) || {};
    const nuevasPreferencias = {
      ...preferenciasActuales,
      ...updatePreferenciasDto,
    };

    if (config) {
      config = await this.prisma.configuracionUsuario.update({
        where: { id: config.id },
        data: { preferencias: nuevasPreferencias },
      });
    } else {
      config = await this.prisma.configuracionUsuario.create({
        data: {
          usuarioId,
          preferencias: nuevasPreferencias,
        },
      });
    }

    return config.preferencias;
  }

  // ========== NOTIFICACIONES ==========

  @Get('notificaciones')
  @ApiOperation({ summary: 'Obtener configuración de notificaciones' })
  @ApiResponse({ status: 200, description: 'Configuración obtenida correctamente' })
  async getNotificaciones(@Request() req) {
    const config = await this.prisma.configuracionUsuario.findFirst({
      where: { usuarioId: req.user.id },
    });

    if (!config || !config.notificaciones) {
      return {
        email: true,
        push: true,
        taskAssigned: true,
        mentions: true,
        projectUpdates: false,
        dailySummary: false,
      };
    }

    return config.notificaciones;
  }

  @Patch('notificaciones')
  @ApiOperation({ summary: 'Actualizar configuración de notificaciones' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada correctamente' })
  async updateNotificaciones(@Request() req, @Body() updateNotificacionesDto: UpdateNotificacionesDto) {
    const usuarioId = req.user.id;

    let config = await this.prisma.configuracionUsuario.findFirst({
      where: { usuarioId },
    });

    const notificacionesActuales = (config?.notificaciones as any) || {};
    const nuevasNotificaciones = {
      ...notificacionesActuales,
      ...updateNotificacionesDto,
    };

    if (config) {
      config = await this.prisma.configuracionUsuario.update({
        where: { id: config.id },
        data: { notificaciones: nuevasNotificaciones },
      });
    } else {
      config = await this.prisma.configuracionUsuario.create({
        data: {
          usuarioId,
          notificaciones: nuevasNotificaciones,
        },
      });
    }

    return config.notificaciones;
  }

  // ========== PERFIL PROFESIONAL ==========

  @Get('perfil-profesional')
  @ApiOperation({ summary: 'Obtener perfil profesional del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil profesional obtenido correctamente' })
  async getPerfilProfesional(@Request() req) {
    const config = await this.prisma.configuracionUsuario.findFirst({
      where: { usuarioId: req.user.id },
    });

    if (!config || !config.perfilProfesional) {
      // Valores por defecto para un perfil profesional nuevo
      return {
        yearsExperience: '',
        professionalLevel: '',
        specializations: [],
        workMode: '',
        currentCapacity: '',
        weeklySchedule: {
          monday: { available: true, timeRange: '9-5' },
          tuesday: { available: true, timeRange: '9-5' },
          wednesday: { available: true, timeRange: '9-5' },
          thursday: { available: true, timeRange: '9-5' },
          friday: { available: true, timeRange: '9-5' },
          saturday: { available: false, timeRange: '' },
          sunday: { available: false, timeRange: '' },
        },
        hasLeadershipExperience: false,
        languages: [],
      };
    }

    return config.perfilProfesional;
  }

  @Patch('perfil-profesional')
  @ApiOperation({ summary: 'Actualizar perfil profesional del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil profesional actualizado correctamente' })
  async updatePerfilProfesional(
    @Request() req,
    @Body() updatePerfilProfesionalDto: UpdatePerfilProfesionalDto,
  ) {
    const usuarioId = req.user.id;

    let config = await this.prisma.configuracionUsuario.findFirst({
      where: { usuarioId },
    });

    const perfilActual = (config?.perfilProfesional as any) || {};
    const nuevoPerfilProfesional = {
      ...perfilActual,
      ...updatePerfilProfesionalDto,
    };

    if (config) {
      config = await this.prisma.configuracionUsuario.update({
        where: { id: config.id },
        data: { perfilProfesional: nuevoPerfilProfesional },
      });
    } else {
      config = await this.prisma.configuracionUsuario.create({
        data: {
          usuarioId,
          perfilProfesional: nuevoPerfilProfesional,
        },
      });
    }

    // Recalcular puntaje del perfil incluyendo perfil profesional
    await this.actualizarPuntajePerfilConProfesional(usuarioId, nuevoPerfilProfesional);

    return config.perfilProfesional;
  }

  // ========== DATOS Y PRIVACIDAD ==========

  @Get('exportar-datos')
  @ApiOperation({ summary: 'Exportar todos los datos del usuario' })
  @ApiResponse({ status: 200, description: 'Datos exportados correctamente' })
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="datos-usuario.json"')
  async exportarDatos(@Request() req): Promise<StreamableFile> {
    const usuarioId = req.user.id;

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: true,
        puestoTrabajo: true,
        supervisor: true,
        proyectosResponsable: true,
        proyectosComoMiembro: true,
        tareasAsignadas: true,
        tareasCreadas: true,
        comentarios: true,
        configuraciones: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const datos = {
      informacionPersonal: {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        biografia: usuario.biografia,
        fechaNacimiento: usuario.fechaNacimiento,
        fechaIngreso: usuario.fechaIngreso,
        avatarUrl: usuario.avatarUrl,
        archivoCvId: usuario.archivoCvId,
      },
      rol: usuario.rol,
      puestoTrabajo: usuario.puestoTrabajo,
      supervisor: usuario.supervisor,
      proyectos: {
        responsable: usuario.proyectosResponsable?.length || 0,
        miembro: usuario.proyectosComoMiembro?.length || 0,
      },
      tareas: {
        asignadas: usuario.tareasAsignadas?.length || 0,
        creadas: usuario.tareasCreadas?.length || 0,
      },
      comentarios: usuario.comentarios?.length || 0,
      configuraciones: usuario.configuraciones,
      fechaExportacion: new Date().toISOString(),
    };

    const buffer = Buffer.from(JSON.stringify(datos, null, 2));
    return new StreamableFile(buffer);
  }

  @Delete('cuenta')
  @ApiOperation({ summary: 'Eliminar cuenta del usuario (eliminación lógica)' })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada correctamente' })
  @ApiResponse({ status: 401, description: 'Contraseña incorrecta' })
  async eliminarCuenta(@Request() req, @Body() eliminarCuentaDto: EliminarCuentaDto) {
    const usuarioId = req.user.id;

    // Verificar contraseña
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!usuario.passwordHash) {
      throw new UnauthorizedException('Usuario sin contraseña configurada');
    }

    const passwordValida = await bcrypt.compare(eliminarCuentaDto.password, usuario.passwordHash);

    if (!passwordValida) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Eliminación lógica
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        fechaEliminacion: new Date(),
        estado: 'INACTIVO',
      },
    });

    return { message: 'Cuenta eliminada correctamente' };
  }

  // ========== MÉTODOS AUXILIARES ==========

  private calcularPuntajePerfil(usuario: any): number {
    let puntaje = 0;
    const campos = [
      usuario.nombreCompleto,
      usuario.email,
      usuario.avatarUrl,
      usuario.biografia,
      usuario.fechaNacimiento,
      usuario.fechaIngreso,
      usuario.archivoCvId,
      usuario.puestoTrabajoId,
    ];

    campos.forEach((campo) => {
      if (campo) puntaje += 12.5;
    });

    return Math.round(puntaje);
  }

  /**
   * Recalcula el puntaje del perfil incluyendo datos del perfil profesional.
   * El perfil profesional puede agregar hasta 20 puntos extra.
   */
  private async actualizarPuntajePerfilConProfesional(
    usuarioId: string,
    perfilProfesional: any,
  ): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) return;

    // Calcular puntaje base (hasta 100 puntos)
    let puntajeBase = this.calcularPuntajePerfil(usuario);

    // Bonus por perfil profesional completo (hasta 20 puntos adicionales)
    let bonusProfesional = 0;
    const camposProfesionales = [
      perfilProfesional?.yearsExperience,
      perfilProfesional?.professionalLevel,
      perfilProfesional?.specializations?.length > 0,
      perfilProfesional?.workMode,
      perfilProfesional?.currentCapacity,
      perfilProfesional?.hasLeadershipExperience !== undefined,
      perfilProfesional?.languages?.length > 0,
    ];

    camposProfesionales.forEach((campo) => {
      if (campo) bonusProfesional += 3;
    });

    // El puntaje no puede exceder 100
    const puntajeFinal = Math.min(100, puntajeBase + Math.min(bonusProfesional, 20));

    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { puntajePerfilCompleto: puntajeFinal },
    });
  }
}
