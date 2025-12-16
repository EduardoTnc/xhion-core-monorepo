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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { TareasService } from './tareas.service';
import {
  CreateTareaDto,
  UpdateTareaDto,
  MoveTareaDto,
  CreateComentarioDto,
  UploadAdjuntoDto,
  ResponderActividadDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';
import { Auditar } from '../auditoria/auditar.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Express } from 'express';

@ApiTags('Tareas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  // ==================== CRUD DE TAREAS ====================

  @Post()
  @RequiresPermission('tareas.crear')
  @Auditar('Crear Tarea')
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({ status: 201, description: 'Tarea creada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o etapa no pertenece al proyecto',
  })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este proyecto' })
  @ApiResponse({
    status: 404,
    description: 'Proyecto o usuario asignado no encontrado',
  })
  create(@Body() createTareaDto: CreateTareaDto, @Request() req) {
    return this.tareasService.create(
      createTareaDto,
      req.user.id,
      req.user.permisos,
    );
  }

  @Get()
  @RequiresPermission('tareas.ver')
  @ApiOperation({
    summary:
      'Obtener tareas del usuario (o todas si tiene permiso tareas.ver_todas)',
  })
  @ApiQuery({
    name: 'proyectoId',
    required: false,
    description: 'Filtrar por proyecto',
  })
  @ApiQuery({
    name: 'etapaId',
    required: false,
    description: 'Filtrar por etapa',
  })
  @ApiQuery({
    name: 'asignadoId',
    required: false,
    description: 'Filtrar por usuario asignado',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'prioridad',
    required: false,
    description: 'Filtrar por prioridad',
  })
  @ApiResponse({ status: 200, description: 'Lista de tareas' })
  findAll(
    @Request() req,
    @Query('proyectoId') proyectoId?: string,
    @Query('etapaId') etapaId?: string,
    @Query('asignadoId') asignadoId?: string,
    @Query('estado') estado?: string,
    @Query('prioridad') prioridad?: string,
  ) {
    return this.tareasService.findAll(req.user.id, req.user.permisos, {
      proyectoId,
      etapaId,
      asignadoId,
      estado,
      prioridad,
    });
  }

  @Get('mis-tareas')
  @RequiresPermission('tareas.ver')
  @ApiOperation({ summary: 'Obtener tareas asignadas al usuario actual' })
  @ApiResponse({ status: 200, description: 'Lista de tareas asignadas' })
  getMisTareas(@Request() req) {
    return this.tareasService.getMisTareas(req.user.id);
  }

  @Get(':id')
  @RequiresPermission('tareas.ver')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiResponse({ status: 200, description: 'Tarea encontrada con comentarios' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tareasService.findOne(id, req.user.id, req.user.permisos);
  }

  @Patch(':id')
  @RequiresPermission('tareas.editar')
  @Auditar('Actualizar Tarea')
  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateTareaDto: UpdateTareaDto,
    @Request() req,
  ) {
    return this.tareasService.update(id, updateTareaDto, req.user.id);
  }

  @Patch(':id/move')
  @RequiresPermission('tareas.cambiar_estado')
  @Auditar('Mover Tarea')
  @ApiOperation({ summary: 'Mover tarea entre etapas o cambiar estado' })
  @ApiResponse({ status: 200, description: 'Tarea movida exitosamente' })
  @ApiResponse({ status: 400, description: 'Etapa no pertenece al proyecto' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  move(
    @Param('id') id: string,
    @Body() moveTareaDto: MoveTareaDto,
    @Request() req,
  ) {
    return this.tareasService.move(id, moveTareaDto, req.user.id);
  }

  @Delete(':id')
  @RequiresPermission('tareas.eliminar')
  @Auditar('Eliminar Tarea')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una tarea (soft delete)' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada exitosamente' })
  @ApiResponse({
    status: 403,
    description: 'Solo el creador o responsable del proyecto pueden eliminar',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tareasService.remove(id, req.user.id, req.user.permisos);
  }

  // ==================== GESTIÓN DE COMENTARIOS ====================

  @Post(':id/comentarios')
  @RequiresPermission('tareas.comentar')
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
    return this.tareasService.addComentario(
      id,
      createComentarioDto,
      req.user.id,
    );
  }

  @Get(':id/comentarios')
  @RequiresPermission('tareas.ver')
  @ApiOperation({ summary: 'Obtener comentarios de una tarea' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  getComentarios(@Param('id') id: string, @Request() req) {
    return this.tareasService.getComentarios(id, req.user.id);
  }

  @Delete(':id/comentarios/:comentarioId')
  @RequiresPermission('tareas.comentar')
  @Auditar('Eliminar Comentario')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un comentario' })
  @ApiResponse({
    status: 200,
    description: 'Comentario eliminado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo el autor puede eliminar el comentario',
  })
  @ApiResponse({ status: 404, description: 'Tarea o comentario no encontrado' })
  removeComentario(
    @Param('id') id: string,
    @Param('comentarioId') comentarioId: string,
    @Request() req,
  ) {
    return this.tareasService.removeComentario(id, comentarioId, req.user.id);
  }

  // ==================== GESTIÓN DE ADJUNTOS ====================

  @Post(':id/adjuntos')
  @RequiresPermission('tareas.editar')
  @Auditar('Agregar Adjunto a Tarea')
  @ApiOperation({ summary: 'Subir un archivo adjunto a una tarea' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
        },
        descripcion: {
          type: 'string',
        },
      },
      required: ['archivo'],
    },
  })
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: './uploads/tareas',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `tarea-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
      },
    }),
  )
  uploadAdjunto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadAdjuntoDto: UploadAdjuntoDto,
    @Request() req,
  ) {
    return this.tareasService.addAdjunto(
      id,
      file,
      uploadAdjuntoDto,
      req.user.id,
    );
  }

  @Get(':id/adjuntos')
  @RequiresPermission('tareas.ver')
  @ApiOperation({ summary: 'Listar adjuntos de una tarea' })
  getAdjuntos(@Param('id') id: string, @Request() req) {
    return this.tareasService.getAdjuntos(id, req.user.id, req.user.permisos);
  }

  @Delete(':id/adjuntos/:archivoId')
  @RequiresPermission('tareas.editar')
  @Auditar('Eliminar Adjunto de Tarea')
  @ApiOperation({ summary: 'Eliminar un archivo adjunto de una tarea' })
  removeAdjunto(
    @Param('id') id: string,
    @Param('archivoId') archivoId: string,
    @Request() req,
  ) {
    return this.tareasService.removeAdjunto(id, archivoId, req.user.id);
  }

  // ==================== ACTIVIDAD ====================

  @Get(':id/actividad')
  @RequiresPermission('tareas.ver')
  @ApiOperation({ summary: 'Obtener la actividad cronológica de una tarea' })
  getActividad(@Param('id') id: string, @Request() req) {
    return this.tareasService.getActividad(id);
  }

  @Post(':id/actividad/:actividadId/responder')
  @RequiresPermission('tareas.comentar')
  @Auditar('Responder actividad de tarea')
  @ApiOperation({
    summary: 'Responder a un evento dentro de la actividad de la tarea',
  })
  responderActividad(
    @Param('id') id: string,
    @Param('actividadId') actividadId: string,
    @Body() responderActividadDto: ResponderActividadDto,
    @Request() req,
  ) {
    return this.tareasService.responderActividad(
      id,
      actividadId,
      responderActividadDto,
      req.user.id,
    );
  }
}
