import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@ApiTags('Departamentos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Post()
  @RequiresPermission('departamentos.crear')
  @ApiOperation({ summary: 'Crear un nuevo departamento' })
  @ApiResponse({ status: 201, description: 'Departamento creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Ya existe un departamento con ese nombre' })
  @ApiResponse({ status: 404, description: 'Jefe no encontrado' })
  async create(@Body() dto: CreateDepartamentoDto) {
    return this.departamentosService.create(dto);
  }

  @Get()
  @RequiresPermission('departamentos.ver')
  @ApiOperation({ summary: 'Listar todos los departamentos' })
  @ApiResponse({ status: 200, description: 'Lista de departamentos' })
  async findAll() {
    return this.departamentosService.findAll();
  }

  @Get(':id')
  @RequiresPermission('departamentos.ver')
  @ApiOperation({ summary: 'Obtener un departamento por ID' })
  @ApiResponse({ status: 200, description: 'Departamento encontrado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.departamentosService.findOne(id);
  }

  @Get(':id/estadisticas')
  @RequiresPermission('departamentos.ver')
  @ApiOperation({ summary: 'Obtener estadísticas de un departamento' })
  @ApiResponse({ status: 200, description: 'Estadísticas del departamento' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  async getEstadisticas(@Param('id') id: string) {
    return this.departamentosService.getEstadisticas(id);
  }

  @Put(':id')
  @RequiresPermission('departamentos.editar')
  @ApiOperation({ summary: 'Actualizar un departamento' })
  @ApiResponse({ status: 200, description: 'Departamento actualizado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre duplicado' })
  async update(@Param('id') id: string, @Body() dto: UpdateDepartamentoDto) {
    return this.departamentosService.update(id, dto);
  }

  @Delete(':id')
  @RequiresPermission('departamentos.eliminar')
  @ApiOperation({ summary: 'Eliminar un departamento (soft delete)' })
  @ApiResponse({ status: 200, description: 'Departamento eliminado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar (tiene dependencias)' })
  async remove(@Param('id') id: string) {
    return this.departamentosService.remove(id);
  }

  @Patch(':id/restaurar')
  @RequiresPermission('departamentos.editar')
  @ApiOperation({ summary: 'Restaurar un departamento eliminado' })
  @ApiResponse({ status: 200, description: 'Departamento restaurado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  @ApiResponse({ status: 400, description: 'El departamento no está eliminado' })
  async restore(@Param('id') id: string) {
    return this.departamentosService.restore(id);
  }
}
