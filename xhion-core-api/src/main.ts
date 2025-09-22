import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Le dice a NestJS que escuche las señales de apagado
  // y que llame a los métodos onModuleDestroy, etc.
  app.enableShutdownHooks();

  const config = app.get(ConfigService);

  // Seguridad HTTP headers
  app.use(helmet());

  // Prefijo global de la API
  app.setGlobalPrefix('api/v1');

  // Validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // elimina propiedades no incluidas en DTO
    forbidNonWhitelisted: true, // lanza error si llegan props extra
    transform: true, // transforma payloads a los tipos DTO
    transformOptions: { enableImplicitConversion: true },
  }));

  // CORS desde dominio Frontend configurable
  const corsOrigin = config.get<string>('FRONTEND_ORIGIN') ?? '*';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
