import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Configuración de Swagger/OpenAPI (Aplicación Global)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('XHION Core API')
    .setDescription('API REST para la plataforma de productividad operativa XHION Core')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Usuarios', 'Gestión de usuarios')
    .addTag('Roles', 'Gestión de roles y permisos')
    .addTag('Proyectos', 'Gestión de proyectos, etapas y miembros')
    .addTag('Invitaciones', 'Sistema de invitaciones')
    .addTag('Sesiones', 'Gestión de sesiones de usuario')
    .addTag('Auditoría', 'Registros de auditoría')
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
