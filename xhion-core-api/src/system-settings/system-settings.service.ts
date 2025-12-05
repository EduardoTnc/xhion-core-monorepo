import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemSettingsService {
    constructor(private prisma: PrismaService) { }

    async getSettings() {
        // Intentar obtener la configuración existente
        const settings = await this.prisma.configuracionSistema.findFirst();

        // Si no existe, crear una por defecto
        if (!settings) {
            return this.prisma.configuracionSistema.create({
                data: {
                    nombreEmpresa: 'Xhion Core',
                    colorPrimario: '#FFBF00',
                    colorSecundario: '#1a1a2e',
                },
            });
        }

        return settings;
    }

    async updateSettings(data: {
        nombreEmpresa?: string;
        logoUrl?: string;
        faviconUrl?: string;
        colorPrimario?: string;
        colorSecundario?: string;
        // Contexto para Magnus IA
        ubicacion?: string;
        descripcionEmpresa?: string;
    }) {
        // Obtener ID de la configuración actual
        let settings = await this.prisma.configuracionSistema.findFirst();

        if (!settings) {
            settings = await this.prisma.configuracionSistema.create({
                data: {
                    nombreEmpresa: 'Xhion Core',
                },
            });
        }

        return this.prisma.configuracionSistema.update({
            where: { id: settings.id },
            data,
        });
    }
}
