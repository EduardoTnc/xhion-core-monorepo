import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SolicitudesAccesoService } from './solicitudes-acceso.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { ReviewSolicitudDto } from './dto/review-solicitud.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';
import type { Request } from 'express';

@ApiTags('Solicitudes de Acceso')
@Controller('solicitudes-acceso')
export class SolicitudesAccesoController {
  constructor(private readonly solicitudesService: SolicitudesAccesoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva solicitud de acceso',
    description: 'Endpoint público para que usuarios externos soliciten acceso al sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitud creada exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una solicitud pendiente o el email ya está registrado',
  })
  async create(@Body() createSolicitudDto: CreateSolicitudDto, @Req() req: Request) {
    // Obtener la IP del solicitante
    const ipAddress = req.ip || req.socket.remoteAddress;

    return this.solicitudesService.create(createSolicitudDto, ipAddress);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiresPermission('usuarios.invitar')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todas las solicitudes',
    description: 'Lista todas las solicitudes con filtros opcionales',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado de la solicitud (Pendiente, Aprobada, Rechazada, Expirada)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes',
  })
  async findAll(@Query('estado') estado?: string) {
    return this.solicitudesService.findAll(estado);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiresPermission('usuarios.invitar')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener estadísticas de solicitudes',
    description: 'Retorna contadores por estado y métricas generales',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de solicitudes',
  })
  async getStats() {
    return this.solicitudesService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiresPermission('usuarios.invitar')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener una solicitud por ID',
    description: 'Retorna los detalles completos de una solicitud',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  async findOne(@Param('id') id: string) {
    return this.solicitudesService.findOne(id);
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiresPermission('usuarios.invitar')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Revisar una solicitud (aprobar o rechazar)',
    description: 'Permite a un administrador aprobar o rechazar una solicitud. Si se aprueba, se crea automáticamente una invitación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud revisada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud no puede ser revisada (ya revisada o expirada)',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  async review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewSolicitudDto,
    @Req() req: any,
  ) {
    const revisadoPorId = req.user.sub; // ID del usuario autenticado
    return this.solicitudesService.review(id, reviewDto, revisadoPorId);
  }

  @Post('expire')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiresPermission('usuarios.gestionar_roles')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Marcar solicitudes expiradas',
    description: 'Marca como expiradas todas las solicitudes pendientes que superaron los 30 días. Este endpoint puede ser llamado por un cron job.',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitudes expiradas marcadas',
  })
  async markExpired() {
    return this.solicitudesService.markExpiredRequests();
  }
}
