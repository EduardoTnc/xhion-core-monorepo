import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PresupuestosService } from './presupuestos.service';
import { CreatePresupuestoDepartamentoDto } from './dto/create-presupuesto-departamento.dto';
import { UpdatePresupuestoDepartamentoDto } from './dto/update-presupuesto-departamento.dto';
import { CreateMovimientoDepartamentoDto } from './dto/create-movimiento-departamento.dto';
import { CreatePresupuestoProyectoDto } from './dto/create-presupuesto-proyecto.dto';
import { UpdatePresupuestoProyectoDto } from './dto/update-presupuesto-proyecto.dto';
import { CreateMovimientoProyectoDto } from './dto/create-movimiento-proyecto.dto';

@ApiTags('Presupuestos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('presupuestos')
export class PresupuestosController {
  constructor(private readonly presupuestosService: PresupuestosService) {}

  // ==================== PRESUPUESTOS DE DEPARTAMENTO ====================

  @Post('departamento')
  @ApiOperation({ summary: 'Crear presupuesto para un departamento' })
  @ApiResponse({ status: 201, description: 'Presupuesto creado exitosamente' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  @ApiResponse({ status: 400, description: 'Ya existe un presupuesto para este periodo' })
  async createPresupuestoDepartamento(
    @Body() dto: CreatePresupuestoDepartamentoDto,
    @Request() req,
  ) {
    return this.presupuestosService.createPresupuestoDepartamento(dto, req.user.sub);
  }

  @Get('departamento/:departamentoId')
  @ApiOperation({ summary: 'Obtener presupuesto de un departamento' })
  @ApiResponse({ status: 200, description: 'Presupuesto encontrado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  async getPresupuestoDepartamento(@Param('departamentoId') departamentoId: string) {
    return this.presupuestosService.getPresupuestoDepartamento(departamentoId);
  }

  @Put('departamento/:departamentoId')
  @ApiOperation({ summary: 'Actualizar presupuesto de un departamento' })
  @ApiResponse({ status: 200, description: 'Presupuesto actualizado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  async updatePresupuestoDepartamento(
    @Param('departamentoId') departamentoId: string,
    @Body() dto: UpdatePresupuestoDepartamentoDto,
  ) {
    return this.presupuestosService.updatePresupuestoDepartamento(departamentoId, dto);
  }

  @Delete('departamento/:departamentoId')
  @ApiOperation({ summary: 'Eliminar presupuesto de un departamento' })
  @ApiResponse({ status: 200, description: 'Presupuesto eliminado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar (tiene movimientos)' })
  async deletePresupuestoDepartamento(@Param('departamentoId') departamentoId: string) {
    return this.presupuestosService.deletePresupuestoDepartamento(departamentoId);
  }

  // ==================== MOVIMIENTOS DE DEPARTAMENTO ====================

  @Post('departamento/movimiento')
  @ApiOperation({ summary: 'Registrar movimiento en presupuesto de departamento' })
  @ApiResponse({ status: 201, description: 'Movimiento registrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  @ApiResponse({ status: 400, description: 'Monto insuficiente o presupuesto inactivo' })
  async createMovimientoDepartamento(
    @Body() dto: CreateMovimientoDepartamentoDto,
    @Request() req,
  ) {
    return this.presupuestosService.createMovimientoDepartamento(dto, req.user.sub);
  }

  @Get('departamento/movimientos/:presupuestoDepartamentoId')
  @ApiOperation({ summary: 'Listar movimientos de un presupuesto de departamento' })
  @ApiResponse({ status: 200, description: 'Lista de movimientos' })
  async getMovimientosDepartamento(
    @Param('presupuestoDepartamentoId') presupuestoDepartamentoId: string,
  ) {
    return this.presupuestosService.getMovimientosDepartamento(presupuestoDepartamentoId);
  }

  @Delete('departamento/movimiento/:id')
  @ApiOperation({ summary: 'Eliminar movimiento de presupuesto de departamento' })
  @ApiResponse({ status: 200, description: 'Movimiento eliminado' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  async deleteMovimientoDepartamento(@Param('id') id: string) {
    return this.presupuestosService.deleteMovimientoDepartamento(id);
  }

  // ==================== PRESUPUESTOS DE PROYECTO ====================

  @Post('proyecto')
  @ApiOperation({ summary: 'Crear presupuesto para un proyecto' })
  @ApiResponse({ status: 201, description: 'Presupuesto creado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @ApiResponse({ status: 400, description: 'El proyecto ya tiene un presupuesto' })
  async createPresupuestoProyecto(@Body() dto: CreatePresupuestoProyectoDto, @Request() req) {
    return this.presupuestosService.createPresupuestoProyecto(dto, req.user.sub);
  }

  @Get('proyecto/:proyectoId')
  @ApiOperation({ summary: 'Obtener presupuesto de un proyecto' })
  @ApiResponse({ status: 200, description: 'Presupuesto encontrado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  async getPresupuestoProyecto(@Param('proyectoId') proyectoId: string) {
    return this.presupuestosService.getPresupuestoProyecto(proyectoId);
  }

  @Put('proyecto/:proyectoId')
  @ApiOperation({ summary: 'Actualizar presupuesto de un proyecto' })
  @ApiResponse({ status: 200, description: 'Presupuesto actualizado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  async updatePresupuestoProyecto(
    @Param('proyectoId') proyectoId: string,
    @Body() dto: UpdatePresupuestoProyectoDto,
  ) {
    return this.presupuestosService.updatePresupuestoProyecto(proyectoId, dto);
  }

  @Delete('proyecto/:proyectoId')
  @ApiOperation({ summary: 'Eliminar presupuesto de un proyecto' })
  @ApiResponse({ status: 200, description: 'Presupuesto eliminado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar (tiene movimientos)' })
  async deletePresupuestoProyecto(@Param('proyectoId') proyectoId: string) {
    return this.presupuestosService.deletePresupuestoProyecto(proyectoId);
  }

  // ==================== MOVIMIENTOS DE PROYECTO ====================

  @Post('proyecto/movimiento')
  @ApiOperation({ summary: 'Registrar movimiento en presupuesto de proyecto' })
  @ApiResponse({ status: 201, description: 'Movimiento registrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  @ApiResponse({ status: 400, description: 'Monto insuficiente o presupuesto inactivo' })
  async createMovimientoProyecto(@Body() dto: CreateMovimientoProyectoDto, @Request() req) {
    return this.presupuestosService.createMovimientoProyecto(dto, req.user.sub);
  }

  @Get('proyecto/movimientos/:presupuestoProyectoId')
  @ApiOperation({ summary: 'Listar movimientos de un presupuesto de proyecto' })
  @ApiResponse({ status: 200, description: 'Lista de movimientos' })
  async getMovimientosProyecto(
    @Param('presupuestoProyectoId') presupuestoProyectoId: string,
  ) {
    return this.presupuestosService.getMovimientosProyecto(presupuestoProyectoId);
  }

  @Delete('proyecto/movimiento/:id')
  @ApiOperation({ summary: 'Eliminar movimiento de presupuesto de proyecto' })
  @ApiResponse({ status: 200, description: 'Movimiento eliminado' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  async deleteMovimientoProyecto(@Param('id') id: string) {
    return this.presupuestosService.deleteMovimientoProyecto(id);
  }
}
