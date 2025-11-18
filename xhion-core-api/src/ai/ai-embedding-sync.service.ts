import { Injectable, Logger } from '@nestjs/common'
import { AiEntityType } from '@prisma/client'
import { AiService } from './ai.service'

@Injectable()
export class AiEmbeddingSyncService {
  private readonly logger = new Logger(AiEmbeddingSyncService.name)

  constructor(private readonly aiService: AiService) {}

  async syncProyecto(id: string) {
    await this.safeSync('Proyecto', id, () => this.aiService.syncEntityEmbedding(AiEntityType.PROJECT, id))
  }

  async deleteProyecto(id: string) {
    await this.safeSync('Proyecto', id, () => this.aiService.deleteEntityEmbeddings(AiEntityType.PROJECT, id))
  }

  async syncTarea(id: string) {
    await this.safeSync('Tarea', id, () => this.aiService.syncEntityEmbedding(AiEntityType.TASK, id))
  }

  async deleteTarea(id: string) {
    await this.safeSync('Tarea', id, () => this.aiService.deleteEntityEmbeddings(AiEntityType.TASK, id))
  }

  async syncDocumento(id: string) {
    await this.safeSync('Documento', id, () => this.aiService.syncEntityEmbedding(AiEntityType.DOCUMENT, id))
  }

  async deleteDocumento(id: string) {
    await this.safeSync('Documento', id, () => this.aiService.deleteEntityEmbeddings(AiEntityType.DOCUMENT, id))
  }

  async syncDepartamento(id: string) {
    await this.safeSync('Departamento', id, () => this.aiService.syncEntityEmbedding(AiEntityType.DEPARTMENT, id))
  }

  async deleteDepartamento(id: string) {
    await this.safeSync('Departamento', id, () => this.aiService.deleteEntityEmbeddings(AiEntityType.DEPARTMENT, id))
  }

  async syncContextoOrganizacional(id: string) {
    await this.safeSync('Contexto Organizacional', id, () =>
      this.aiService.syncEntityEmbedding(AiEntityType.KNOWLEDGE, id),
    )
  }

  async deleteContextoOrganizacional(id: string) {
    await this.safeSync('Contexto Organizacional', id, () =>
      this.aiService.deleteEntityEmbeddings(AiEntityType.KNOWLEDGE, id),
    )
  }

  async syncIdea(id: string) {
    await this.safeSync('Idea', id, () => this.aiService.syncEntityEmbedding(AiEntityType.IDEA, id))
  }

  async deleteIdea(id: string) {
    await this.safeSync('Idea', id, () => this.aiService.deleteEntityEmbeddings(AiEntityType.IDEA, id))
  }

  private async safeSync(label: string, id: string, action: () => Promise<any>) {
    try {
      await action()
    } catch (error) {
      this.logger.warn(
        `[${label}] No se pudo sincronizar embeddings (${id}): ${error instanceof Error ? error.message : error}`,
      )
    }
  }
}
