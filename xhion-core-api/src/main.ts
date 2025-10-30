import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Le dice a NestJS que escuche las señales de apagado (Aplicación Global)
  // y que llame a los métodos onModuleDestroy, etc.
  app.enableShutdownHooks();

  const config = app.get(ConfigService);

  // Seguridad HTTP headers (Aplicación Global)
  app.use(helmet());

  // Prefijo global de la API (Aplicación Global)
  app.setGlobalPrefix('api/v1');

  // Validación global de DTOs (Aplicación Global)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // elimina propiedades no incluidas en DTO
    forbidNonWhitelisted: true, // lanza error si llegan props extra
    transform: true, // transforma payloads a los tipos DTO
    transformOptions: { enableImplicitConversion: true },
  }));

  // CORS desde dominio Frontend configurable (Aplicación Global)
  const corsOrigin = config.get<string>('FRONTEND_ORIGIN') ?? '*';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Servir archivos estáticos (uploads de avatar y CV)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Configuración de Swagger/OpenAPI (Aplicación Global)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('XHION Core API')
    .setDescription(
      '🚀 API REST para la plataforma de productividad operativa XHION Core\n\n' +
      '## 🔐 Sistema de Permisos Granulares\n\n' +
      'Esta API implementa un sistema completo de permisos granulares con 54 permisos organizados en 10 módulos.\n\n' +
      '### Credenciales de Prueba:\n' +
      '- **Email:** admin@xhion.com\n' +
      '- **Password:** Admin12345!\n' +
      '- **Rol:** Administrador (todos los permisos)\n\n' +
      '### Flujo de Autenticación:\n' +
      '1. Hacer login en `/auth/login` con las credenciales\n' +
      '2. Copiar el token JWT de la respuesta\n' +
      '3. Hacer clic en el botón "Authorize" arriba\n' +
      '4. Pegar el token (sin "Bearer")\n' +
      '5. Probar cualquier endpoint protegido\n\n' +
      '### Permisos por Módulo:\n' +
      '- **Proyectos:** crear, ver, editar, eliminar, archivar, gestionar_miembros, gestionar_etapas\n' +
      '- **Tareas:** crear, ver, editar, eliminar, asignar, cambiar_estado, comentar\n' +
      '- **Departamentos:** crear, ver, editar, eliminar, gestionar_empleados, gestionar_puestos\n' +
      '- **Presupuestos:** crear, ver, editar, eliminar, aprobar, registrar_movimientos\n' +
      '- **Conocimiento:** crear, ver, editar, eliminar\n' +
      '- **Usuarios:** crear, ver, editar, eliminar, gestionar_roles, invitar\n' +
      '- **Roles:** crear, ver, editar, eliminar, asignar_permisos\n' +
      '- **Auditoría:** ver, exportar\n' +
      '- **Sistema:** configurar, ver_estadisticas, gestionar_catalogos\n' +
      '- **Invitaciones:** crear, ver, cancelar'
    )
    .setVersion('1.0')
    .setContact(
      'XHION Core Team',
      'https://xhion.com',
      'support@xhion.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT (sin "Bearer")',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', '🔐 Autenticación y autorización')
    .addTag('Usuarios', '👥 Gestión de usuarios y asignación de roles')
    .addTag('Roles', '🎭 Gestión de roles y permisos granulares')
    .addTag('Proyectos', '📁 Gestión de proyectos, etapas y miembros')
    .addTag('Tareas', '✅ Gestión de tareas y comentarios')
    .addTag('Departamentos', '🏢 Gestión de departamentos y empleados')
    .addTag('Presupuestos', '💰 Gestión de presupuestos y movimientos')
    .addTag('Conocimiento', '📚 Base de conocimiento organizacional')
    .addTag('Invitaciones', '✉️ Sistema de invitaciones de usuarios')
    .addTag('Sesiones', '🔑 Gestión de sesiones activas')
    .addTag('Auditoría', '📊 Registros de auditoría del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'XHION Core API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Puerto de escucha (Aplicación Global)
  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
