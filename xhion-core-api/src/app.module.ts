import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InvitacionesModule } from './invitaciones/invitaciones.module';

@Module({
  imports: [PrismaModule, AuthModule, InvitacionesModule],
})
export class AppModule {}
