import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  GetTimelineQueryDto,
  ActualizarFechasProyectoDto,
  ResolverAlertaDto,
} from './dto/timeline.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controlador de Dashboard
 * 
 * Endpoints para el dashboard minimalista con 4 widgets
 */
@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * ============================================
   * CRONOGRAMA VIVO - TIMELINE MAESTRO
   * ============================================
   */

  @Get('timeline')
  @ApiOperation({ summary: 'Obtener datos completos del timeline' })
  @ApiResponse({ status: 200, description: 'Timeline obtenido exitosamente' })
  async getTimelineData(@Query() query: GetTimelineQueryDto, @Req() req: any) {
    return this.dashboardService.getTimelineData(query, req.user.sub);
  }

  @Get('timeline/proyecto/:id')
  @ApiOperation({ summary: 'Obtener proyecto específico del timeline' })
  @ApiResponse({ status: 200, description: 'Proyecto obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  async getProyectoTimeline(@Param('id') id: string) {
    return this.dashboardService.getProyectoTimeline(id);
  }

  @Patch('timeline/proyecto/:id/fechas')
  @ApiOperation({ summary: 'Actualizar fechas de proyecto (reprogramar)' })
  @ApiResponse({
    status: 200,
    description: 'Fechas actualizadas exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  async actualizarFechasProyecto(
    @Param('id') id: string,
    @Body() dto: ActualizarFechasProyectoDto,
  ) {
    return this.dashboardService.actualizarFechasProyecto(id, dto);
  }

  @Get('timeline/sugerencias')
  @ApiOperation({ summary: 'Obtener sugerencias IA globales' })
  @ApiResponse({
    status: 200,
    description: 'Sugerencias obtenidas exitosamente',
  })
  async getSugerenciasGlobales(@Req() req: any) {
    return this.dashboardService.getSugerenciasGlobales(req.user.sub);
  }

  @Post('timeline/sugerencias/:id/aplicar')
  @ApiOperation({ summary: 'Aplicar sugerencia IA' })
  @ApiResponse({ status: 200, description: 'Sugerencia aplicada exitosamente' })
  async aplicarSugerencia(@Param('id') id: string, @Req() req: any) {
    return this.dashboardService.aplicarSugerencia(id, req.user.sub);
  }

  @Post('timeline/sugerencias/:id/descartar')
  @ApiOperation({ summary: 'Descartar sugerencia IA' })
  @ApiResponse({
    status: 200,
    description: 'Sugerencia descartada exitosamente',
  })
  async descartarSugerencia(@Param('id') id: string, @Req() req: any) {
    return this.dashboardService.descartarSugerencia(id, req.user.sub);
  }

  @Patch('timeline/alertas/:id/vista')
  @ApiOperation({ summary: 'Marcar alerta como vista' })
  @ApiResponse({ status: 200, description: 'Alerta marcada como vista' })
  async marcarAlertaVista(@Param('id') id: string) {
    // TODO: Implementar en el servicio
    return { success: true };
  }

  @Post('timeline/alertas/:id/resolver')
  @ApiOperation({ summary: 'Resolver alerta' })
  @ApiResponse({ status: 200, description: 'Alerta resuelta exitosamente' })
  async resolverAlerta(
    @Param('id') id: string,
    @Body() dto: ResolverAlertaDto,
  ) {
    // TODO: Implementar en el servicio
    return { success: true };
  }

  @Get('timeline/proyecto/:id/dependencias')
  @ApiOperation({ summary: 'Obtener dependencias de un proyecto' })
  @ApiResponse({
    status: 200,
    description: 'Dependencias obtenidas exitosamente',
  })
  async getDependencias(@Param('id') id: string) {
    // TODO: Implementar en el servicio
    return {
      bloqueantes: [],
      relacionados: [],
    };
  }

  /**
   * ============================================
   * MI DÍA - CENTRO DE COMANDO PERSONAL
   * ============================================
   */

  @Get('mi-dia')
  @ApiOperation({ summary: 'Obtener datos de "Mi Día"' })
  @ApiResponse({ status: 200, description: 'Datos obtenidos exitosamente' })
  async getMyDayData(@Req() req: any) {
    return this.dashboardService.getMyDayData(req.user.sub);
  }

  /**
   * ============================================
   * EQUIPO - MAPA DE CARGA
   * ============================================
   */

  @Get('equipo')
  @ApiOperation({ summary: 'Obtener datos de carga del equipo' })
  @ApiResponse({ status: 200, description: 'Datos obtenidos exitosamente' })
  async getTeamLoadData(@Req() req: any) {
    return this.dashboardService.getTeamLoadData(req.user.sub);
  }
}
