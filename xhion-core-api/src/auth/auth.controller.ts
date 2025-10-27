import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { RefreshTokenGuard } from './refresh-token.guard';
import type { Request } from 'express';
import { Auditar } from '../auditoria/auditar.decorator';
import { Throttle, seconds } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // MARK: - /login
  @Post('login')
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario con email y contraseña. Retorna tokens JWT (access y refresh) y datos del usuario.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso. Retorna accessToken, refreshToken y datos del usuario.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          email: 'admin@xhion.com',
          nombreCompleto: 'Administrador XHION',
          rol: { id: 'uuid', nombre: 'Administrador' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos. Intenta de nuevo en 20 segundos.' })
  @Auditar('INICIO_SESION_EXITOSO')
  @Throttle({ default: { limit: 5, ttl: seconds(20) } })
  async login(@Body() dto: LoginDto, @Req() req: Request & { auditUsuarioId?: string; auditDetalles?: string }) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    req.auditUsuarioId = user.id;
    req.auditDetalles = JSON.stringify({ email: user.email });
    return this.authService.login({ id: user.id, email: user.email, rolId: user.rolId }, req);
  }

  // MARK: - /accept-invitation
  @Post('accept-invitation')
  @ApiOperation({ 
    summary: 'Aceptar invitación',
    description: 'Permite a un usuario invitado completar su registro aceptando la invitación con un token válido.'
  })
  @ApiResponse({ status: 201, description: 'Invitación aceptada exitosamente. Usuario creado.' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada' })
  @Auditar('ACEPTAR_INVITACION')
  async acceptInvitation(@Body() dto: AcceptInvitationDto, @Req() req: Request & { auditUsuarioId?: string; auditDetalles?: string }) {
    const profileData = {
      avatarUrl: dto.avatarUrl,
      telefono: dto.telefono,
      fechaNacimiento: dto.fechaNacimiento,
      biografia: dto.biografia,
    };
    const result = await this.authService.acceptInvitation(dto.token, dto.password, profileData, req);
    req.auditUsuarioId = result.userId;
    req.auditDetalles = JSON.stringify({ token: dto.token });
    return result;
  }

  // MARK: - /me
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener usuario actual',
    description: 'Retorna la información del usuario autenticado actualmente.'
  })
  @ApiResponse({ status: 200, description: 'Datos del usuario actual' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @Auditar('OBTENER_MI_USUARIO')
  @Get('me')
  async me(@Req() req: any) {
    return req.user;
  }

  // MARK: - /refresh
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ 
    summary: 'Refrescar token',
    description: 'Genera un nuevo accessToken usando un refreshToken válido.'
  })
  @ApiResponse({ status: 200, description: 'Nuevo accessToken generado' })
  @ApiResponse({ status: 401, description: 'RefreshToken inválido o expirado' })
  @Auditar('REFRESH_TOKEN')
  @Post('refresh')
  async refresh(@Req() req: Request & { user: any; auditUsuarioId?: string }) {
    const { userId, email, sessionId, refreshToken } = req.user;
    req.auditUsuarioId = userId;
    return this.authService.refreshToken(userId, email, sessionId, refreshToken, req);
  }

  // MARK: - /logout
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cerrar sesión',
    description: 'Invalida la sesión actual del usuario y revoca los tokens.'
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @Auditar('CERRAR_SESION')
  @Post('logout')
  async logout(@Req() req: Request & { user: any; auditUsuarioId?: string; auditDetalles?: string }) {
    const sessionId = req.user.sessionId;
    req.auditUsuarioId = req.user.id;
    req.auditDetalles = JSON.stringify({ sessionId });
    return this.authService.logout(sessionId, req.user.id);
  }
}
