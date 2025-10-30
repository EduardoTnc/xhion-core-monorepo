import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosConfiguracionController } from './usuarios-configuracion.controller';
import { UsuariosService } from './usuarios.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    UsuariosController,
    UsuariosConfiguracionController,
  ],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
