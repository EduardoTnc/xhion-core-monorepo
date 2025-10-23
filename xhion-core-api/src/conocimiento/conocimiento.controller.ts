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
import { ConocimientoService } from './conocimiento.service';
import { CreateContextoOrganizacionalDto } from './dto/create-contexto-organizacional.dto';
import { UpdateContextoOrganizacionalDto } from './dto/update-contexto-organizacional.dto';
import { CreateContextoDepartamentoDto } from './dto/create-contexto-departamento.dto';
import { UpdateContextoDepartamentoDto } from './dto/update-contexto-departamento.dto';
import { CreateDocumentoProyectoDto } from './dto/create-documento-proyecto.dto';
import { UpdateDocumentoProyectoDto } from './dto/update-documento-proyecto.dto';

@ApiTags('Conocimiento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conocimiento')
export class ConocimientoController {
  constructor(private readonly conocimientoService: ConocimientoService) {}

  // ==================== CONTEXTO ORGANIZACIONAL ====================

  @Post('organizacional')
  @ApiOperation({ summary: 'Crear o actualizar contexto organizacional' })
  @ApiResponse({ status: 200, description: 'Contexto organizacional creado/actualizado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async upsertContextoOrganizacional(
    @Body() dto: CreateContextoOrganizacionalDto,
    @Request() req,
  ) {
    return this.conocimientoService.upsertContextoOrganizacional(dto, req.user.sub);
  }

  @Get('organizacional')
  @ApiOperation({ summary: 'Obtener contexto organizacional' })
  @ApiResponse({ status: 200, description: 'Contexto organizacional obtenido' })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async getContextoOrganizacional() {
    return this.conocimientoService.getContextoOrganizacional();
  }

  // ==================== CONTEXTO DEPARTAMENTO ====================

  @Post('departamento')
  @ApiOperation({ summary: 'Crear contexto de departamento' })
  @ApiResponse({ status: 201, description: 'Contexto de departamento creado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  @ApiResponse({ status: 409, description: 'El departamento ya tiene contexto' })
  async createContextoDepartamento(
    @Body() dto: CreateContextoDepartamentoDto,
    @Request() req,
  ) {
    return this.conocimientoService.createContextoDepartamento(dto, req.user.sub);
  }

  @Get('departamento')
  @ApiOperation({ summary: 'Listar todos los contextos de departamentos' })
  @ApiResponse({ status: 200, description: 'Lista de contextos de departamentos' })
  async getAllContextosDepartamento() {
    return this.conocimientoService.getAllContextosDepartamento();
  }

  @Get('departamento/:departamentoId')
  @ApiOperation({ summary: 'Obtener contexto de un departamento' })
  @ApiResponse({ status: 200, description: 'Contexto de departamento obtenido' })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async getContextoDepartamento(@Param('departamentoId') departamentoId: string) {
    return this.conocimientoService.getContextoDepartamento(departamentoId);
  }

  @Put('departamento/:departamentoId')
  @ApiOperation({ summary: 'Actualizar contexto de departamento' })
  @ApiResponse({ status: 200, description: 'Contexto de departamento actualizado' })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async updateContextoDepartamento(
    @Param('departamentoId') departamentoId: string,
    @Body() dto: UpdateContextoDepartamentoDto,
    @Request() req,
  ) {
    return this.conocimientoService.updateContextoDepartamento(
      departamentoId,
      dto,
      req.user.sub,
    );
  }

  @Delete('departamento/:departamentoId')
  @ApiOperation({ summary: 'Eliminar contexto de departamento' })
  @ApiResponse({ status: 200, description: 'Contexto de departamento eliminado' })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async deleteContextoDepartamento(@Param('departamentoId') departamentoId: string) {
    return this.conocimientoService.deleteContextoDepartamento(departamentoId);
  }

  // ==================== DOCUMENTOS DE PROYECTO ====================

  @Post('documentos')
  @ApiOperation({ summary: 'Crear documento de proyecto' })
  @ApiResponse({ status: 201, description: 'Documento de proyecto creado' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permiso para crear documentos' })
  async createDocumentoProyecto(
    @Body() dto: CreateDocumentoProyectoDto,
    @Request() req,
  ) {
    return this.conocimientoService.createDocumentoProyecto(dto, req.user.sub);
  }

  @Get('documentos/proyecto/:proyectoId')
  @ApiOperation({ summary: 'Obtener documentos de un proyecto' })
  @ApiResponse({ status: 200, description: 'Lista de documentos del proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permiso para ver documentos' })
  async getDocumentosProyecto(
    @Param('proyectoId') proyectoId: string,
    @Request() req,
  ) {
    return this.conocimientoService.getDocumentosProyecto(proyectoId, req.user.sub);
  }

  @Get('documentos/:id')
  @ApiOperation({ summary: 'Obtener un documento específico' })
  @ApiResponse({ status: 200, description: 'Documento obtenido' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permiso para ver el documento' })
  async getDocumentoProyecto(@Param('id') id: string, @Request() req) {
    return this.conocimientoService.getDocumentoProyecto(id, req.user.sub);
  }

  @Put('documentos/:id')
  @ApiOperation({ summary: 'Actualizar documento de proyecto' })
  @ApiResponse({ status: 200, description: 'Documento actualizado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permiso para actualizar' })
  async updateDocumentoProyecto(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentoProyectoDto,
    @Request() req,
  ) {
    return this.conocimientoService.updateDocumentoProyecto(id, dto, req.user.sub);
  }

  @Delete('documentos/:id')
  @ApiOperation({ summary: 'Eliminar documento de proyecto' })
  @ApiResponse({ status: 200, description: 'Documento eliminado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permiso para eliminar' })
  async deleteDocumentoProyecto(@Param('id') id: string, @Request() req) {
    return this.conocimientoService.deleteDocumentoProyecto(id, req.user.sub);
  }
}
