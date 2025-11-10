import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva notificación' })
  @ApiResponse({ status: 201, description: 'Notificación creada exitosamente' })
  create(@Body() createNotificacionDto: CreateNotificacionDto) {
    return this.notificacionesService.create(createNotificacionDto);
  }

  @Get('mis-notificaciones')
  @ApiOperation({ summary: 'Obtener notificaciones del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  findMine(
    @Request() req: any,
    @Query('soloNoLeidas', new ParseBoolPipe({ optional: true })) soloNoLeidas?: boolean,
  ) {
    return this.notificacionesService.findByUsuario(req.user.userId, soloNoLeidas);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Obtener notificaciones de un usuario específico' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones del usuario' })
  findByUsuario(
    @Param('usuarioId') usuarioId: string,
    @Query('soloNoLeidas', new ParseBoolPipe({ optional: true })) soloNoLeidas?: boolean,
  ) {
    return this.notificacionesService.findByUsuario(usuarioId, soloNoLeidas);
  }

  @Get('no-leidas/count')
  @ApiOperation({ summary: 'Contar notificaciones no leídas del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Cantidad de notificaciones no leídas' })
  countUnread(@Request() req: any) {
    return this.notificacionesService.contarNoLeidas(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una notificación por ID' })
  @ApiResponse({ status: 200, description: 'Notificación encontrada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.notificacionesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación actualizada exitosamente' })
  update(@Param('id') id: string, @Body() updateNotificacionDto: UpdateNotificacionDto) {
    return this.notificacionesService.update(id, updateNotificacionDto);
  }

  @Patch(':id/marcar-leida')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  marcarComoLeida(@Param('id') id: string) {
    return this.notificacionesService.marcarComoLeida(id);
  }

  @Patch('marcar-todas-leidas')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas' })
  marcarTodasComoLeidas(@Request() req: any) {
    return this.notificacionesService.marcarTodasComoLeidas(req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada exitosamente' })
  remove(@Param('id') id: string) {
    return this.notificacionesService.remove(id);
  }

  @Delete('eliminar-leidas')
  @ApiOperation({ summary: 'Eliminar todas las notificaciones leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones leídas eliminadas' })
  eliminarLeidas(@Request() req: any) {
    return this.notificacionesService.eliminarLeidas(req.user.userId);
  }
}
