import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { Body, Patch, UnauthorizedException } from '@nestjs/common';

@ApiTags('Sesiones y Seguridad')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthSesionesController {
  constructor(private readonly prisma: PrismaService) {}

  // ========== CAMBIAR CONTRASEÑA ==========

  @Patch('cambiar-contrasena')
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada correctamente' })
  @ApiResponse({ status: 401, description: 'Contraseña actual incorrecta' })
  async cambiarContrasena(@Request() req, @Body() cambiarContrasenaDto: CambiarContrasenaDto) {
    const usuarioId = req.user.id;

    // Obtener usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!usuario.passwordHash) {
      throw new UnauthorizedException('Usuario sin contraseña configurada');
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(
      cambiarContrasenaDto.currentPassword,
      usuario.passwordHash,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hash de la nueva contraseña
    const nuevoHash = await bcrypt.hash(cambiarContrasenaDto.newPassword, 10);

    // Actualizar contraseña
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { passwordHash: nuevoHash },
    });

    return { message: 'Contraseña cambiada correctamente' };
  }

  // ========== SESIONES ==========

  @Get('sesiones')
  @ApiOperation({ summary: 'Obtener todas las sesiones activas del usuario' })
  @ApiResponse({ status: 200, description: 'Sesiones obtenidas correctamente' })
  async getSesiones(@Request() req) {
    const usuarioId = req.user.id;

    const sesiones = await this.prisma.sesion.findMany({
      where: {
        usuarioId,
        fechaExpiracion: {
          gte: new Date(),
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    // Obtener el token actual del request
    const tokenActual = req.headers.authorization?.replace('Bearer ', '');

    return sesiones.map((sesion) => ({
      id: sesion.id,
      userAgent: sesion.userAgent || 'Navegador desconocido',
      ip: sesion.direccionIp || 'IP desconocida',
      lastActivity: sesion.fechaUltimoUso,
      isCurrentSession: sesion.accessToken === tokenActual,
      createdAt: sesion.fechaCreacion,
    }));
  }

  @Delete('sesiones/:id')
  @ApiOperation({ summary: 'Cerrar una sesión específica' })
  @ApiParam({ name: 'id', description: 'ID de la sesión a cerrar' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  @ApiResponse({ status: 403, description: 'No puedes cerrar la sesión actual' })
  async cerrarSesion(@Request() req, @Param('id') sesionId: string) {
    const usuarioId = req.user.id;

    // Verificar que la sesión existe y pertenece al usuario
    const sesion = await this.prisma.sesion.findUnique({
      where: { id: sesionId },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (sesion.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para cerrar esta sesión');
    }

    // No permitir cerrar la sesión actual
    const tokenActual = req.headers.authorization?.replace('Bearer ', '');
    if (sesion.accessToken === tokenActual) {
      throw new ForbiddenException('No puedes cerrar tu sesión actual');
    }

    // Eliminar la sesión
    await this.prisma.sesion.delete({
      where: { id: sesionId },
    });

    return { message: 'Sesión cerrada correctamente' };
  }

  @Delete('sesiones/todas')
  @ApiOperation({ summary: 'Cerrar todas las sesiones excepto la actual' })
  @ApiResponse({ status: 200, description: 'Sesiones cerradas correctamente' })
  async cerrarTodasLasSesiones(@Request() req) {
    const usuarioId = req.user.id;
    const tokenActual = req.headers.authorization?.replace('Bearer ', '');

    // Eliminar todas las sesiones excepto la actual
    const resultado = await this.prisma.sesion.deleteMany({
      where: {
        usuarioId,
        accessToken: {
          not: tokenActual,
        },
      },
    });

    return {
      message: 'Sesiones cerradas correctamente',
      sesionesEliminadas: resultado.count,
    };
  }
}
