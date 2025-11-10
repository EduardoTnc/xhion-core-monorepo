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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecursosService } from './recursos.service';
import { CreateRecursoDto } from './dto/create-recurso.dto';
import { UpdateRecursoDto } from './dto/update-recurso.dto';
import { AsignarRecursoDto } from './dto/asignar-recurso.dto';
import { RegistrarMovimientoDto } from './dto/registrar-movimiento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';
import { TipoRecurso, EstadoRecurso } from '@prisma/client';

@ApiTags('Recursos e Inventario')
@Controller('recursos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RecursosController {
  constructor(private readonly recursosService: RecursosService) {}

  // ============================================
  // CRUD BÁSICO
  // ============================================

  @Post()
  @RequiresPermission('recursos:crear')
  @ApiOperation({ summary: 'Crear un nuevo recurso' })
  crear(@Body() dto: CreateRecursoDto, @Request() req) {
    return this.recursosService.crear(dto, req.user.id);
  }

  @Get()
  @RequiresPermission('recursos:ver')
  @ApiOperation({ summary: 'Obtener todos los recursos' })
  @ApiQuery({ name: 'tipo', enum: TipoRecurso, required: false })
  @ApiQuery({ name: 'estado', enum: EstadoRecurso, required: false })
  @ApiQuery({ name: 'categoria', required: false })
  @ApiQuery({ name: 'busqueda', required: false })
  obtenerTodos(
    @Query('tipo') tipo?: TipoRecurso,
    @Query('estado') estado?: EstadoRecurso,
    @Query('categoria') categoria?: string,
    @Query('busqueda') busqueda?: string,
  ) {
    return this.recursosService.obtenerTodos({
      tipo,
      estado,
      categoria,
      busqueda,
    });
  }

  @Get(':id')
  @RequiresPermission('recursos:ver')
  @ApiOperation({ summary: 'Obtener un recurso por ID' })
  obtenerPorId(@Param('id') id: string) {
    return this.recursosService.obtenerPorId(id);
  }

  @Patch(':id')
  @RequiresPermission('recursos:editar')
  @ApiOperation({ summary: 'Actualizar un recurso' })
  actualizar(@Param('id') id: string, @Body() dto: UpdateRecursoDto) {
    return this.recursosService.actualizar(id, dto);
  }

  @Delete(':id')
  @RequiresPermission('recursos:eliminar')
  @ApiOperation({ summary: 'Eliminar un recurso (soft delete)' })
  eliminar(@Param('id') id: string) {
    return this.recursosService.eliminar(id);
  }

  // ============================================
  // ASIGNACIONES
  // ============================================

  @Post(':id/asignar')
  @RequiresPermission('recursos:asignar')
  @ApiOperation({ summary: 'Asignar recurso a departamento o proyecto' })
  asignar(
    @Param('id') id: string,
    @Body() dto: AsignarRecursoDto,
    @Request() req,
  ) {
    return this.recursosService.asignar(id, dto, req.user.id);
  }

  @Get(':id/asignaciones')
  @RequiresPermission('recursos:ver')
  @ApiOperation({ summary: 'Obtener asignaciones activas de un recurso' })
  obtenerAsignaciones(@Param('id') id: string) {
    return this.recursosService.obtenerAsignaciones(id);
  }

  @Patch('asignaciones/:asignacionId/finalizar')
  @RequiresPermission('recursos:asignar')
  @ApiOperation({ summary: 'Finalizar una asignación' })
  finalizarAsignacion(@Param('asignacionId') asignacionId: string) {
    return this.recursosService.finalizarAsignacion(asignacionId);
  }

  // ============================================
  // MOVIMIENTOS DE INVENTARIO
  // ============================================

  @Post(':id/movimientos')
  @RequiresPermission('recursos:registrar_movimiento')
  @ApiOperation({ summary: 'Registrar movimiento de inventario' })
  registrarMovimiento(
    @Param('id') id: string,
    @Body() dto: RegistrarMovimientoDto,
    @Request() req,
  ) {
    return this.recursosService.registrarMovimiento(id, dto, req.user.id);
  }

  @Get(':id/movimientos')
  @RequiresPermission('recursos:ver')
  @ApiOperation({ summary: 'Obtener historial de movimientos de un recurso' })
  obtenerHistorialMovimientos(@Param('id') id: string) {
    return this.recursosService.obtenerHistorialMovimientos(id);
  }

  // ============================================
  // ALERTAS Y REPORTES
  // ============================================

  @Get('alertas/stock-bajo')
  @RequiresPermission('recursos:ver')
  @ApiOperation({ summary: 'Obtener recursos con stock bajo' })
  obtenerAlertasStockBajo() {
    return this.recursosService.obtenerAlertasStockBajo();
  }

  @Get('reportes/por-departamento/:departamentoId')
  @RequiresPermission('recursos:ver')
  @ApiOperation({ summary: 'Obtener recursos asignados a un departamento' })
  obtenerPorDepartamento(@Param('departamentoId') departamentoId: string) {
    return this.recursosService.obtenerPorDepartamento(departamentoId);
  }

  @Get('reportes/por-proyecto/:proyectoId')
  @RequiresPermission('recursos:ver')
  @ApiOperation({ summary: 'Obtener recursos asignados a un proyecto' })
  obtenerPorProyecto(@Param('proyectoId') proyectoId: string) {
    return this.recursosService.obtenerPorProyecto(proyectoId);
  }

  @Get('reportes/costos')
  @RequiresPermission('recursos:ver')
  @ApiOperation({ summary: 'Obtener reporte de costos de inventario' })
  obtenerReporteCostos() {
    return this.recursosService.obtenerReporteCostos();
  }
}
