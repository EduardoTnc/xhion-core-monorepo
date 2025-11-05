import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo de Dashboard
 * 
 * Proporciona endpoints para el dashboard minimalista con 4 widgets:
 * 1. Cronograma Vivo (Timeline Maestro)
 * 2. Mi Día (Centro de Comando Personal)
 * 3. Equipo (Mapa de Carga)
 * 4. Asistente IA (Sugerencias Inteligentes)
 */
@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
