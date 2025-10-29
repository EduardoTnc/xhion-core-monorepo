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
import { ProyectosService } from './proyectos.service';
import {
  CreateProyectoDto,
  UpdateProyectoDto,
  AddMiembroDto,
  CreateEtapaDto,
  UpdateEtapaDto,
  ReorderEtapasDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';
import { Auditar } from '../auditoria/auditar.decorator';

@ApiTags('Proyectos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  // ==================== CRUD DE PROYECTOS ====================

  @Post()
  @RequiresPermission('proyectos.crear')
  @Auditar('Crear Proyecto')
  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Responsable o departamento no encontrado' })
  create(@Body() createProyectoDto: CreateProyectoDto, @Request() req) {
    return this.proyectosService.create(createProyectoDto, req.user.id);
  }

  @Get()
  @RequiresPermission('proyectos.ver')
  @ApiOperation({ summary: 'Obtener proyectos del usuario (o todos si tiene permiso proyectos.ver_todos)' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'departamentoId', required: false, description: 'Filtrar por departamento' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos' })
  findAll(@Request() req, @Query('estado') estado?: string, @Query('departamentoId') departamentoId?: string) {
    return this.proyectosService.findAll(req.user.id, req.user.permisos, { estado, departamentoId });
  }

  @Get(':id')
  @RequiresPermission('proyectos.ver')
  @ApiOperation({ summary: 'Obtener un proyecto por ID' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.proyectosService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @RequiresPermission('proyectos.editar')
  @Auditar('Actualizar Proyecto')
  @ApiOperation({ summary: 'Actualizar un proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el responsable puede actualizar el proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  update(@Param('id') id: string, @Body() updateProyectoDto: UpdateProyectoDto, @Request() req) {
    return this.proyectosService.update(id, updateProyectoDto, req.user.id);
  }

  @Delete(':id')
  @RequiresPermission('proyectos.eliminar')
  @Auditar('Eliminar Proyecto')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un proyecto (soft delete)' })
  @ApiResponse({ status: 200, description: 'Proyecto eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el responsable puede eliminar el proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.proyectosService.remove(id, req.user.id);
  }

  // ==================== GESTIÓN DE MIEMBROS ====================

  @Post(':id/miembros')
  @RequiresPermission('proyectos.gestionar_miembros')
  @Auditar('Agregar Miembro a Proyecto')
  @ApiOperation({ summary: 'Agregar un miembro al proyecto' })
  @ApiResponse({ status: 201, description: 'Miembro agregado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el responsable puede agregar miembros' })
  @ApiResponse({ status: 404, description: 'Proyecto o usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El usuario ya es miembro del proyecto' })
  addMiembro(@Param('id') id: string, @Body() addMiembroDto: AddMiembroDto, @Request() req) {
    return this.proyectosService.addMiembro(id, addMiembroDto, req.user.id);
  }

  @Get(':id/miembros')
  @RequiresPermission('proyectos.ver')
  @ApiOperation({ summary: 'Obtener miembros de un proyecto' })
  @ApiResponse({ status: 200, description: 'Lista de miembros' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  getMiembros(@Param('id') id: string, @Request() req) {
    return this.proyectosService.getMiembros(id, req.user.id);
  }

  @Delete(':id/miembros/:miembroId')
  @RequiresPermission('proyectos.gestionar_miembros')
  @Auditar('Remover Miembro de Proyecto')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover un miembro del proyecto' })
  @ApiResponse({ status: 200, description: 'Miembro removido exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede remover al responsable' })
  @ApiResponse({ status: 403, description: 'Solo el responsable puede remover miembros' })
  @ApiResponse({ status: 404, description: 'Proyecto o miembro no encontrado' })
  removeMiembro(@Param('id') id: string, @Param('miembroId') miembroId: string, @Request() req) {
    return this.proyectosService.removeMiembro(id, miembroId, req.user.id);
  }

  // ==================== GESTIÓN DE ETAPAS ====================

  @Post(':id/etapas')
  @RequiresPermission('proyectos.gestionar_etapas')
  @Auditar('Crear Etapa en Proyecto')
  @ApiOperation({ summary: 'Crear una etapa en el proyecto' })
  @ApiResponse({ status: 201, description: 'Etapa creada exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el responsable puede crear etapas' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe una etapa con ese orden' })
  createEtapa(@Param('id') id: string, @Body() createEtapaDto: CreateEtapaDto, @Request() req) {
    return this.proyectosService.createEtapa(id, createEtapaDto, req.user.id);
  }

  @Get(':id/etapas')
  @RequiresPermission('proyectos.ver')
  @ApiOperation({ summary: 'Obtener etapas de un proyecto' })
  @ApiResponse({ status: 200, description: 'Lista de etapas ordenadas' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  getEtapas(@Param('id') id: string, @Request() req) {
    return this.proyectosService.getEtapas(id, req.user.id);
  }

  @Patch(':id/etapas/:etapaId')
  @RequiresPermission('proyectos.gestionar_etapas')
  @Auditar('Actualizar Etapa')
  @ApiOperation({ summary: 'Actualizar una etapa' })
  @ApiResponse({ status: 200, description: 'Etapa actualizada exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el responsable puede actualizar etapas' })
  @ApiResponse({ status: 404, description: 'Proyecto o etapa no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya existe una etapa con ese orden' })
  updateEtapa(
    @Param('id') id: string,
    @Param('etapaId') etapaId: string,
    @Body() updateEtapaDto: UpdateEtapaDto,
    @Request() req,
  ) {
    return this.proyectosService.updateEtapa(id, etapaId, updateEtapaDto, req.user.id);
  }

  @Delete(':id/etapas/:etapaId')
  @RequiresPermission('proyectos.gestionar_etapas')
  @Auditar('Eliminar Etapa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una etapa' })
  @ApiResponse({ status: 200, description: 'Etapa eliminada exitosamente' })
  @ApiResponse({ status: 400, description: 'La etapa tiene tareas asociadas' })
  @ApiResponse({ status: 403, description: 'Solo el responsable puede eliminar etapas' })
  @ApiResponse({ status: 404, description: 'Proyecto o etapa no encontrada' })
  removeEtapa(@Param('id') id: string, @Param('etapaId') etapaId: string, @Request() req) {
    return this.proyectosService.removeEtapa(id, etapaId, req.user.id);
  }

  @Patch(':id/etapas/reorder')
  @RequiresPermission('proyectos.gestionar_etapas')
  @Auditar('Reordenar Etapas')
  @ApiOperation({ summary: 'Reordenar etapas de un proyecto' })
  @ApiResponse({ status: 200, description: 'Etapas reordenadas exitosamente' })
  @ApiResponse({ status: 400, description: 'Algunas etapas no pertenecen a este proyecto' })
  @ApiResponse({ status: 403, description: 'Solo el responsable puede reordenar etapas' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  reorderEtapas(@Param('id') id: string, @Body() reorderDto: ReorderEtapasDto, @Request() req) {
    return this.proyectosService.reorderEtapas(id, reorderDto, req.user.id);
  }
}
