import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InvitacionesModule } from './invitaciones/invitaciones.module';
import { SesionesModule } from './sesiones/sesiones.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuditInterceptor } from './auditoria/audit.interceptor';
import { ThrottlerModule, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { TareasModule } from './tareas/tareas.module';
import { ConocimientoModule } from './conocimiento/conocimiento.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { PresupuestosModule } from './presupuestos/presupuestos.module';
import { IdeasModule } from './ideas/ideas.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL') || seconds(60), // 60 segundos
          limit: configService.get<number>('THROTTLE_LIMIT') || 60, // 60 peticiones
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    InvitacionesModule,
    SesionesModule,
    AuditoriaModule,
    RolesModule,
    UsuariosModule,
    DepartamentosModule,
    ProyectosModule,
    TareasModule,
    ConocimientoModule,
    PresupuestosModule,
    IdeasModule,
    DashboardModule,
  ],
  providers: [
    // Guard que se encarga de limitar el número de peticiones (Aplicación Global)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Interceptor que se encarga de registrar la auditoria (Aplicación Global)
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
