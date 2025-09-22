import { Module } from '@nestjs/common';
import { InvitacionesController } from './invitaciones.controller';
import { InvitacionesService } from './invitaciones.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InvitacionesController],
  providers: [InvitacionesService]
})
export class InvitacionesModule {}
