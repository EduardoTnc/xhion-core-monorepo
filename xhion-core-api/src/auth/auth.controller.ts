import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { RefreshTokenGuard } from './refresh-token.guard';
import type { Request } from 'express';
import { Auditar } from '../auditoria/auditar.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Auditar('INICIO_SESION_EXITOSO')
  @Throttle(5, 60)
  async login(@Body() dto: LoginDto, @Req() req: Request & { auditUsuarioId?: string; auditDetalles?: string }) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    req.auditUsuarioId = user.id;
    req.auditDetalles = JSON.stringify({ email: user.email });
    return this.authService.login({ id: user.id, email: user.email, rolId: user.rolId }, req);
  }

  @Post('accept-invitation')
  @Auditar('ACEPTAR_INVITACION')
  async acceptInvitation(@Body() dto: AcceptInvitationDto, @Req() req: Request & { auditUsuarioId?: string; auditDetalles?: string }) {
    const result = await this.authService.acceptInvitation(dto.token, dto.password, req);
    req.auditUsuarioId = result.userId;
    req.auditDetalles = JSON.stringify({ token: dto.token });
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return req.user;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req: Request & { user: any; auditUsuarioId?: string }) {
    const { userId, email, sessionId, refreshToken } = req.user;
    req.auditUsuarioId = userId;
    return this.authService.refreshToken(userId, email, sessionId, refreshToken, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request & { user: any; auditUsuarioId?: string; auditDetalles?: string }) {
    const sessionId = req.user.sessionId;
    req.auditUsuarioId = req.user.id;
    req.auditDetalles = JSON.stringify({ sessionId });
    return this.authService.logout(sessionId, req.user.id);
  }
}
