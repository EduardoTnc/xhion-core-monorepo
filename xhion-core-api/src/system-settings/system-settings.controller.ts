import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';

@Controller('system-settings')
export class SystemSettingsController {
    constructor(private readonly settingsService: SystemSettingsService) { }

    @Get()
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequiresPermission('sistema.configurar_empresa')
    async updateSettings(@Body() body: {
        nombreEmpresa?: string;
        logoUrl?: string;
        faviconUrl?: string;
        colorPrimario?: string;
        colorSecundario?: string;
    }) {
        return this.settingsService.updateSettings(body);
    }
}
