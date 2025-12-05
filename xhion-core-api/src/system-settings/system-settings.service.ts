import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

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

    /**
     * Elimina un archivo del sistema de archivos basándose en su URL
     * @param fileUrl - URL relativa del archivo (ej: /uploads/company/file.png)
     */
    private deleteOldFile(fileUrl: string | null | undefined): void {
        if (!fileUrl) return;

        try {
            // Convertir URL a path del sistema de archivos
            // La URL es como: /uploads/company/file-123.png
            // El path real es: ./uploads/company/file-123.png
            const filePath = path.join('.', fileUrl);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`[SystemSettings] Archivo antiguo eliminado: ${filePath}`);
            }
        } catch (error) {
            // No fallar si no se puede eliminar, solo loggear
            console.warn(`[SystemSettings] No se pudo eliminar archivo antiguo: ${fileUrl}`, error);
        }
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

        // Si se está actualizando el logo, eliminar el anterior
        if (data.logoUrl && settings.logoUrl && data.logoUrl !== settings.logoUrl) {
            this.deleteOldFile(settings.logoUrl);
        }

        // Si se está actualizando el favicon, eliminar el anterior
        if (data.faviconUrl && settings.faviconUrl && data.faviconUrl !== settings.faviconUrl) {
            this.deleteOldFile(settings.faviconUrl);
        }

        return this.prisma.configuracionSistema.update({
            where: { id: settings.id },
            data,
        });
    }
}
