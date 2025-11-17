import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../prisma/prisma.module'
import { AuditoriaModule } from '../auditoria/auditoria.module'
import { AiService } from './ai.service'
import { AiController } from './ai.controller'

@Module({
  imports: [ConfigModule, PrismaModule, AuditoriaModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
