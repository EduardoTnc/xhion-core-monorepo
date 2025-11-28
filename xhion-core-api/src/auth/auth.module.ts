import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SesionesModule } from '../sesiones/sesiones.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthSesionesController } from './auth-sesiones.controller';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenStrategy } from './refresh-token.strategy';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    SesionesModule,
    PassportModule,
    AuditoriaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'changeme',
        // No seteamos expiresIn aquí para permitir expiraciones distintas por token
        signOptions: {},
      }),
    }),
  ],
  controllers: [
    AuthController,
    AuthSesionesController,
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
})
export class AuthModule { }
