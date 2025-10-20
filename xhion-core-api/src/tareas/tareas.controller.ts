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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TareasService } from './tareas.service';
import { CreateTareaDto, UpdateTareaDto, MoveTareaDto, CreateComentarioDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Auditar } from '../auditoria/auditar.decorator';

@ApiTags('Tareas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  // ==================== CRUD DE TAREAS ====================

  @Post()
  @Auditar('Crear Tarea')
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({ status: 201, description: 'Tarea creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o etapa no pertenece al proyecto' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto o usuario asignado no encontrado' })
  create(@Body() createTareaDto: CreateTareaDto, @Request() req) {
    return this.tareasService.create(createTareaDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas con filtros opcionales' })
  @ApiQuery({ name: 'proyectoId', required: false, description: 'Filtrar por proyecto' })
  @ApiQuery({ name: 'etapaId', required: false, description: 'Filtrar por etapa' })
  @ApiQuery({ name: 'asignadoId', required: false, description: 'Filtrar por usuario asignado' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'prioridad', required: false, description: 'Filtrar por prioridad' })
  @ApiResponse({ status: 200, description: 'Lista de tareas' })
  findAll(
    @Request() req,
    @Query('proyectoId') proyectoId?: string,
    @Query('etapaId') etapaId?: string,
    @Query('asignadoId') asignadoId?: string,
    @Query('estado') estado?: string,
    @Query('prioridad') prioridad?: string,
  ) {
    return this.tareasService.findAll(req.user.id, {
      proyectoId,
      etapaId,
      asignadoId,
      estado,
      prioridad,
    });
  }

  @Get('mis-tareas')
  @ApiOperation({ summary: 'Obtener tareas asignadas al usuario actual' })
  @ApiResponse({ status: 200, description: 'Lista de tareas asignadas' })
  getMisTareas(@Request() req) {
    return this.tareasService.getMisTareas(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiResponse({ status: 200, description: 'Tarea encontrada con comentarios' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tareasService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @Auditar('Actualizar Tarea')
  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  update(@Param('id') id: string, @Body() updateTareaDto: UpdateTareaDto, @Request() req) {
    return this.tareasService.update(id, updateTareaDto, req.user.id);
  }

  @Patch(':id/move')
  @Auditar('Mover Tarea')
  @ApiOperation({ summary: 'Mover tarea entre etapas o cambiar estado' })
  @ApiResponse({ status: 200, description: 'Tarea movida exitosamente' })
  @ApiResponse({ status: 400, description: 'Etapa no pertenece al proyecto' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  move(@Param('id') id: string, @Body() moveTareaDto: MoveTareaDto, @Request() req) {
    return this.tareasService.move(id, moveTareaDto, req.user.id);
  }

  @Delete(':id')
  @Auditar('Eliminar Tarea')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una tarea (soft delete)' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el creador o responsable del proyecto pueden eliminar' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tareasService.remove(id, req.user.id);
  }

  // ==================== GESTIÓN DE COMENTARIOS ====================

  @Post(':id/comentarios')
  @Auditar('Agregar Comentario')
  @ApiOperation({ summary: 'Agregar un comentario a una tarea' })
  @ApiResponse({ status: 201, description: 'Comentario agregado exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  addComentario(
    @Param('id') id: string,
    @Body() createComentarioDto: CreateComentarioDto,
    @Request() req,
  ) {
    return this.tareasService.addComentario(id, createComentarioDto, req.user.id);
  }

  @Get(':id/comentarios')
  @ApiOperation({ summary: 'Obtener comentarios de una tarea' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  getComentarios(@Param('id') id: string, @Request() req) {
    return this.tareasService.getComentarios(id, req.user.id);
  }

  @Delete(':id/comentarios/:comentarioId')
  @Auditar('Eliminar Comentario')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un comentario' })
  @ApiResponse({ status: 200, description: 'Comentario eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el autor puede eliminar el comentario' })
  @ApiResponse({ status: 404, description: 'Tarea o comentario no encontrado' })
  removeComentario(
    @Param('id') id: string,
    @Param('comentarioId') comentarioId: string,
    @Request() req,
  ) {
    return this.tareasService.removeComentario(id, comentarioId, req.user.id);
  }
}
