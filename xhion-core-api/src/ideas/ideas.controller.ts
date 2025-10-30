import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IdeasService } from './ideas.service';
import { CrearIdeaDto } from './dto/crear-idea.dto';
import { ActualizarIdeaDto } from './dto/actualizar-idea.dto';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriaIdea, EstadoIdea } from '@prisma/client';

@ApiTags('Ideas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  // ========== CRUD DE IDEAS ==========

  @Post()
  @ApiOperation({ summary: 'Crear una nueva idea' })
  @ApiResponse({ status: 201, description: 'Idea creada correctamente' })
  async crear(@Request() req, @Body() crearIdeaDto: CrearIdeaDto) {
    return this.ideasService.crear(req.user.id, crearIdeaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las ideas' })
  @ApiQuery({ name: 'categoria', enum: CategoriaIdea, required: false })
  @ApiQuery({ name: 'estado', enum: EstadoIdea, required: false })
  @ApiQuery({ name: 'busqueda', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Lista de ideas' })
  async obtenerTodas(
    @Query('categoria') categoria?: CategoriaIdea,
    @Query('estado') estado?: EstadoIdea,
    @Query('busqueda') busqueda?: string,
  ) {
    return this.ideasService.obtenerTodas(categoria, estado, busqueda);
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de ideas' })
  @ApiResponse({ status: 200, description: 'Estadísticas de ideas' })
  async obtenerEstadisticas() {
    return this.ideasService.obtenerEstadisticas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una idea por ID' })
  @ApiResponse({ status: 200, description: 'Idea encontrada' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  async obtenerPorId(@Param('id') id: string) {
    return this.ideasService.obtenerPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una idea' })
  @ApiResponse({ status: 200, description: 'Idea actualizada correctamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para editar esta idea' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  async actualizar(
    @Param('id') id: string,
    @Request() req,
    @Body() actualizarIdeaDto: ActualizarIdeaDto,
  ) {
    return this.ideasService.actualizar(id, req.user.id, actualizarIdeaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una idea' })
  @ApiResponse({ status: 200, description: 'Idea eliminada correctamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar esta idea' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  async eliminar(@Param('id') id: string, @Request() req) {
    return this.ideasService.eliminar(id, req.user.id);
  }

  // ========== VOTOS ==========

  @Post(':id/votar')
  @ApiOperation({ summary: 'Votar o remover voto de una idea' })
  @ApiResponse({ status: 200, description: 'Voto agregado/removido correctamente' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  async votar(@Param('id') id: string, @Request() req) {
    return this.ideasService.votar(id, req.user.id);
  }

  @Get(':id/votantes')
  @ApiOperation({ summary: 'Obtener lista de votantes de una idea' })
  @ApiResponse({ status: 200, description: 'Lista de votantes' })
  async obtenerVotantes(@Param('id') id: string) {
    return this.ideasService.obtenerVotantes(id);
  }

  // ========== COMENTARIOS ==========

  @Post(':id/comentarios')
  @ApiOperation({ summary: 'Crear un comentario en una idea' })
  @ApiResponse({ status: 201, description: 'Comentario creado correctamente' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  async crearComentario(
    @Param('id') id: string,
    @Request() req,
    @Body() crearComentarioDto: CrearComentarioDto,
  ) {
    return this.ideasService.crearComentario(id, req.user.id, crearComentarioDto);
  }

  @Get(':id/comentarios')
  @ApiOperation({ summary: 'Obtener comentarios de una idea' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios' })
  async obtenerComentarios(@Param('id') id: string) {
    return this.ideasService.obtenerComentarios(id);
  }

  @Delete('comentarios/:comentarioId')
  @ApiOperation({ summary: 'Eliminar un comentario' })
  @ApiResponse({ status: 200, description: 'Comentario eliminado correctamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar este comentario' })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  async eliminarComentario(@Param('comentarioId') comentarioId: string, @Request() req) {
    return this.ideasService.eliminarComentario(comentarioId, req.user.id);
  }
}
