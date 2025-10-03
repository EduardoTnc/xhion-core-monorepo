import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

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

  // Puerto de escucha (Aplicación Global)
  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
