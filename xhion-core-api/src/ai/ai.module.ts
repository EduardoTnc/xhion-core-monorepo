import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../prisma/prisma.module'
import { AuditoriaModule } from '../auditoria/auditoria.module'
import { AiService } from './ai.service'
import { AiController } from './ai.controller'
import { AiEmbeddingSyncService } from './ai-embedding-sync.service'

@Module({
  imports: [ConfigModule, PrismaModule, AuditoriaModule],
  controllers: [AiController],
  providers: [AiService, AiEmbeddingSyncService],
  exports: [AiService, AiEmbeddingSyncService],
})
export class AiModule {}
