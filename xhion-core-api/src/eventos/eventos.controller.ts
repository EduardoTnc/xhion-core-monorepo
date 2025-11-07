import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { FiltrarEventosDto } from './dto/filtrar-eventos.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Eventos')
@ApiBearerAuth()
@Controller('eventos')
@UseGuards(JwtAuthGuard)
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo evento' })
  @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() createEventoDto: CreateEventoDto, @Request() req: any) {
    return this.eventosService.create(createEventoDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los eventos con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Lista de eventos' })
  @ApiQuery({ name: 'usuarioId', required: false, description: 'Filtrar por usuario' })
  @ApiQuery({ name: 'proyectoId', required: false, description: 'Filtrar por proyecto' })
  @ApiQuery({ name: 'tipo', required: false, description: 'Filtrar por tipo de evento' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'fechaDesde', required: false, description: 'Fecha de inicio del rango' })
  @ApiQuery({ name: 'fechaHasta', required: false, description: 'Fecha de fin del rango' })
  findAll(@Query() filtros: FiltrarEventosDto) {
    return this.eventosService.findAll(filtros);
  }

  @Get('proximos')
  @ApiOperation({ summary: 'Obtener próximos eventos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de próximos eventos' })
  @ApiQuery({ name: 'dias', required: false, description: 'Número de días a futuro (default: 7)' })
  findEventosProximos(@Query('dias') dias: string, @Request() req: any) {
    const diasNum = dias ? parseInt(dias, 10) : 7;
    return this.eventosService.findEventosProximos(req.user.id, diasNum);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Obtener eventos de un usuario específico' })
  @ApiResponse({ status: 200, description: 'Lista de eventos del usuario' })
  @ApiQuery({ name: 'fechaDesde', required: false, description: 'Fecha de inicio del rango' })
  @ApiQuery({ name: 'fechaHasta', required: false, description: 'Fecha de fin del rango' })
  findEventosByUsuario(
    @Param('usuarioId') usuarioId: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.eventosService.findEventosByUsuario(usuarioId, fechaDesde, fechaHasta);
  }

  @Get('proyecto/:proyectoId')
  @ApiOperation({ summary: 'Obtener eventos de un proyecto específico' })
  @ApiResponse({ status: 200, description: 'Lista de eventos del proyecto' })
  findEventosByProyecto(@Param('proyectoId') proyectoId: string) {
    return this.eventosService.findEventosByProyecto(proyectoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un evento por ID' })
  @ApiResponse({ status: 200, description: 'Evento encontrado' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  findOne(@Param('id') id: string) {
    return this.eventosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un evento' })
  @ApiResponse({ status: 200, description: 'Evento actualizado exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para editar este evento' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateEventoDto: UpdateEventoDto,
    @Request() req: any,
  ) {
    return this.eventosService.update(id, updateEventoDto, req.user.id);
  }

  @Patch(':id/mover')
  @ApiOperation({ summary: 'Mover un evento (Drag & Drop)' })
  @ApiResponse({ status: 200, description: 'Evento movido exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para mover este evento' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  moverEvento(
    @Param('id') id: string,
    @Body() body: { fechaInicio: string; fechaFin: string },
    @Request() req: any,
  ) {
    return this.eventosService.moverEvento(id, body.fechaInicio, body.fechaFin, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un evento (soft delete)' })
  @ApiResponse({ status: 200, description: 'Evento eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para eliminar este evento' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.eventosService.remove(id, req.user.id);
  }

  @Post(':id/participantes')
  @ApiOperation({ summary: 'Agregar un participante a un evento' })
  @ApiResponse({ status: 201, description: 'Participante agregado exitosamente' })
  @ApiResponse({ status: 400, description: 'El usuario ya es participante' })
  @ApiResponse({ status: 404, description: 'Evento o usuario no encontrado' })
  addParticipante(@Param('id') eventoId: string, @Body() body: { usuarioId: string }) {
    return this.eventosService.addParticipante(eventoId, body.usuarioId);
  }

  @Delete(':id/participantes/:usuarioId')
  @ApiOperation({ summary: 'Remover un participante de un evento' })
  @ApiResponse({ status: 200, description: 'Participante removido exitosamente' })
  @ApiResponse({ status: 404, description: 'Evento o participante no encontrado' })
  removeParticipante(
    @Param('id') eventoId: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.eventosService.removeParticipante(eventoId, usuarioId);
  }

  @Post(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar asistencia a un evento' })
  @ApiResponse({ status: 200, description: 'Asistencia confirmada exitosamente' })
  @ApiResponse({ status: 404, description: 'No eres participante de este evento' })
  confirmarAsistencia(@Param('id') eventoId: string, @Request() req: any) {
    return this.eventosService.confirmarAsistencia(eventoId, req.user.id);
  }
}
