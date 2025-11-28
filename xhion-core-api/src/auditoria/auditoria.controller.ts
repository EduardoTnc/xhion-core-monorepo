import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';
import { Parser } from 'json2csv';

@Controller('auditoria')
@UseGuards(JwtAuthGuard)
export class AuditoriaController {
    constructor(private readonly auditoriaService: AuditoriaService) { }

    @Get()
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('usuarioId') usuarioId?: string,
        @Query('accion') accion?: string,
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
        @Query('search') search?: string,
    ) {
        const skip = (page - 1) * limit;
        const take = Number(limit);

        return this.auditoriaService.findAll({
            skip,
            take,
            usuarioId,
            accion,
            fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
            fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
            search,
        });
    }

    @Get('export')
    async export(
        @Res() res: Response,
        @Query('usuarioId') usuarioId?: string,
        @Query('accion') accion?: string,
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
    ) {
        const { data } = await this.auditoriaService.findAll({
            skip: 0,
            take: 10000, // Limit export to 10k records
            usuarioId,
            accion,
            fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
            fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
        });

        const fields = ['id', 'timestamp', 'accion', 'usuario.nombreCompleto', 'usuario.email', 'direccionIp', 'detalles'];
        const opts = { fields };

        try {
            const parser = new Parser(opts);
            const csv = parser.parse(data);

            res.header('Content-Type', 'text/csv');
            res.attachment('auditoria.csv');
            return res.send(csv);
        } catch (err) {
            return res.status(500).json({ message: 'Error generating CSV' });
        }
    }

    @Get('stats')
    async getStats() {
        return this.auditoriaService.getStats();
    }

    @Get('active-users')
    async getActiveUsers() {
        return this.auditoriaService.getActiveUsers();
    }
}
