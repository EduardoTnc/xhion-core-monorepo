import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, AiEntityType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import {
  AiActionSuggestionDto,
  AiFeedbackDto,
  AiIdeasAnalyzeRequestDto,
  AiIdeasAnalyzeResponseDto,
  AiIdeaClusterDto,
  AiProjectAssistRequestDto,
  AiProjectAssistResponseDto,
  AiProjectAssistStageDto,
  AiProjectAssistTaskDto,
  AiReindexRequestDto,
  AiSearchIntent,
  AiSearchQueryDto,
  AiSearchResultDto,
} from './dto/ai-search.dto'
import { GeminiClient } from './gemini.client'

interface SearchContext {
  projects: any[]
  tasks: any[]
  users: any[]
  documents: any[]
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private readonly textModelName = 'gemini-1.5-flash'
  private readonly embeddingModelName = 'text-embedding-004'
  private readonly geminiClient: GeminiClient

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')
    this.geminiClient = new GeminiClient(this.logger, apiKey, {
      textModelName: this.textModelName,
      embeddingModelName: this.embeddingModelName,
      cacheTtlMs: this.configService.get<number>('AI_CACHE_TTL_MS') ?? 30_000,
      breakerThreshold: this.configService.get<number>('AI_BREAKER_THRESHOLD') ?? 3,
      breakerCooldownMs: this.configService.get<number>('AI_BREAKER_COOLDOWN_MS') ?? 60_000,
    })
  }

  async assistProject(
    dto: AiProjectAssistRequestDto,
    userId: string | null,
  ): Promise<AiProjectAssistResponseDto> {
    const similarProjects = await this.prisma.proyecto.findMany({
      where: {
        fechaEliminacion: null,
        OR: [
          { nombre: { contains: dto.description, mode: Prisma.QueryMode.insensitive } },
          { descripcion: { contains: dto.description, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        fechaFin: true,
        departamento: { select: { id: true, nombre: true } },
      },
      take: 5,
    })

    const confidence = Math.min(0.65 + similarProjects.length * 0.05, 0.92)
    const title = this.deriveProjectName(dto.description)
    const stages = this.buildAssistStages(dto.description)
    const today = new Date()
    const totalDays = stages.reduce((acc, stage) => acc + stage.durationDays, 0)
    const suggestedEnd = dto.targetDate ? new Date(dto.targetDate) : new Date(today.getTime() + totalDays * 24 * 60 * 60 * 1000)

    const suggestedProject = {
      nombre: title,
      descripcion: dto.description,
      departamentoId: dto.departmentId ?? null,
      metodologia: dto.preferredMethodology ?? 'Ágil adaptativa',
      fechaInicio: today.toISOString(),
      fechaFin: suggestedEnd.toISOString(),
    }

    const risks = this.buildAssistRisks(dto, similarProjects, stages)
    const fallbackSummary = `Generé ${stages.length} etapas para "${title}", contemplando ${totalDays} días estimados y riesgos principales: ${risks.slice(0, 2).join('; ')}.`
    const summaryPrompt = this.buildAssistPrompt(dto.description, stages, similarProjects, risks)
    const summary = await this.generateTextWithFallback(summaryPrompt, fallbackSummary)

    await this.logQuery({
      userId,
      query: dto.description,
      status: 'ASSIST_PROJECT',
      metadata: {
        similarProjects: similarProjects.length,
        confidence,
      },
    })

    return {
      summary,
      confidence,
      suggestedProject,
      stages,
      risks,
    }
  }

  async analyzeIdeas(dto: AiIdeasAnalyzeRequestDto): Promise<AiIdeasAnalyzeResponseDto> {
    const limit = Math.min(Math.max(dto.limit ?? 30, 5), 80)
    const windowDays = dto.windowDays ?? 45
    const msWindow = windowDays * 24 * 60 * 60 * 1000
    const windowStart = new Date(Date.now() - msWindow)

    const ideas = await this.prisma.idea.findMany({
      where: {
        fechaCreacion: { gte: windowStart },
      },
      orderBy: { fechaCreacion: 'desc' },
      take: limit,
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        categoria: true,
        estado: true,
        tags: true,
        aiScore: true,
        aiInsight: true,
      },
    })

    if (!ideas.length) {
      return {
        summary: 'No hay ideas recientes para analizar.',
        clusters: [],
        strategicRecommendations: ['Captura nuevas ideas para generar análisis con IA.'],
      }
    }

    const clusters = this.buildIdeaClusters(ideas)
    const recommendations = this.buildIdeaRecommendations(ideas, clusters)
    const fallbackSummary = `Analicé ${ideas.length} ideas recientes y detecté ${clusters.length} temáticas predominantes.`
    const prompt = this.buildIdeasPrompt(ideas, clusters, recommendations)
    const summary = await this.generateTextWithFallback(prompt, fallbackSummary)

    return {
      summary,
      clusters,
      strategicRecommendations: recommendations,
    }
  }

  async search(dto: AiSearchQueryDto, userId: string | null): Promise<AiSearchResultDto> {
    const startedAt = Date.now()
    const intent = this.detectIntent(dto.query)

    try {
      const context = await this.fetchContextData(dto.query)
      const summary = await this.generateNarrative(dto.query, context)
      const actionSuggestions = this.buildActionSuggestions(intent, dto.query, context)

      const logEntry = await this.logQuery({
        userId,
        query: dto.query,
        status: 'SUCCESS',
        metadata: {
          intent,
          counts: {
            projects: context.projects.length,
            tasks: context.tasks.length,
            users: context.users.length,
            documents: context.documents.length,
          },
        },
      })

      return {
        queryId: logEntry.id,
        summary,
        resultsByEntity: {
          projects: context.projects,
          tasks: context.tasks,
          users: context.users,
          documents: context.documents,
        },
        intent,
        actionSuggestions,
        processingTimeMs: Date.now() - startedAt,
      }
    } catch (error) {
      await this.logQuery({
        userId,
        query: dto.query,
        status: 'ERROR',
        metadata: {
          intent,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })
      this.logger.error(`AI search failed: ${error instanceof Error ? error.message : error}`)
      throw error
    }
  }

  async reindexKnowledgeBase(options: AiReindexRequestDto = {}): Promise<{ processed: number }> {
    const { entityType, entityId } = options
    const targetTypes = entityType
      ? [entityType]
      : [
          AiEntityType.PROJECT,
          AiEntityType.TASK,
          AiEntityType.DOCUMENT,
          AiEntityType.USER,
          AiEntityType.IDEA,
          AiEntityType.DEPARTMENT,
          AiEntityType.KNOWLEDGE,
        ]

    let processed = 0
    for (const type of targetTypes) {
      processed += await this.reindexByType(type, entityId)
    }

    return { processed }
  }

  async syncEntityEmbedding(entityType: AiEntityType, entityId: string) {
    const entities = await this.collectEntitiesForEmbedding(entityType, entityId)

    if (!entities.length) {
      await this.deleteEntityEmbeddings(entityType, entityId)
      return 0
    }

    let processed = 0
    for (const entity of entities) {
      processed += await this.upsertEmbeddingsForEntity(
        entityType,
        entity.id,
        entity.text,
        entity.source,
        entity.metadata,
        true,
      )
    }

    return processed
  }

  async deleteEntityEmbeddings(entityType: AiEntityType, entityId: string) {
    await this.prisma.aiEmbedding.deleteMany({ where: { entityType, entityId } })
  }

  async listQueryLogs(take = 20) {
    const safeTake = Math.min(Math.max(take, 1), 100)
    return this.prisma.aiQueryLog.findMany({
      orderBy: { fechaCreacion: 'desc' },
      take: safeTake,
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    })
  }

  async getStatus() {
    const [embeddingCount, logCount, lastLog, coverage] = await this.prisma.$transaction([
      this.prisma.aiEmbedding.count(),
      this.prisma.aiQueryLog.count(),
      this.prisma.aiQueryLog.findFirst({ orderBy: { fechaCreacion: 'desc' } }),
      this.prisma.aiEmbedding.groupBy({
        by: ['entityType'],
        orderBy: { entityType: 'asc' },
        _count: { _all: true },
      }),
    ])

    return {
      embeddingCount,
      logCount,
      lastQueryAt: lastLog?.fechaCreacion ?? null,
      entityCoverage: coverage.map((item) => {
        const countAggregate = item._count as { _all?: number } | null
        return {
          entityType: item.entityType,
          count: countAggregate?._all ?? 0,
        }
      }),
      geminiConfigured: this.geminiClient.isReady(),
    }
  }

  private async fetchContextData(query: string): Promise<SearchContext> {
    const [projects, tasks, users, documents] = await Promise.all([
      this.prisma.proyecto.findMany({
        where: {
          fechaEliminacion: null,
          OR: [
            { nombre: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { descripcion: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { objetivos: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          estado: true,
          fechaFin: true,
          departamento: { select: { nombre: true } },
        },
        take: 5,
      }),
      this.prisma.tarea.findMany({
        where: {
          fechaEliminacion: null,
          OR: [
            { titulo: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { descripcion: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        select: {
          id: true,
          titulo: true,
          estado: true,
          prioridad: true,
          proyecto: { select: { nombre: true } },
          asignado: { select: { nombreCompleto: true } },
        },
        take: 5,
      }),
      this.prisma.usuario.findMany({
        where: {
          OR: [
            { nombreCompleto: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        select: {
          id: true,
          nombreCompleto: true,
          email: true,
          rol: { select: { nombre: true } },
        },
        take: 5,
      }),
      this.prisma.documentoProyecto.findMany({
        where: {
          OR: [
            { titulo: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { contenido: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        select: {
          id: true,
          titulo: true,
          tipo: true,
          proyecto: { select: { nombre: true } },
        },
        take: 5,
      }),
    ])

    return {
      projects,
      tasks,
      users,
      documents,
    }
  }

  private detectIntent(query: string): AiSearchIntent {
    const normalized = query.toLowerCase()
    if (/(crear|agendar|programar|asignar|añadir)/.test(normalized)) {
      return AiSearchIntent.COMMAND
    }
    if (/(riesgo|análisis|estado|resumen|cuál|qué)/.test(normalized)) {
      return AiSearchIntent.INSIGHT
    }
    return AiSearchIntent.QUERY
  }

  private buildActionSuggestions(
    intent: AiSearchIntent,
    query: string,
    context: SearchContext,
  ): AiActionSuggestionDto[] {
    if (intent !== AiSearchIntent.COMMAND) {
      return []
    }

    const suggestions: AiActionSuggestionDto[] = []
    const normalized = query.toLowerCase()

    if (normalized.includes('tarea')) {
      suggestions.push({
        entityType: AiEntityType.TASK,
        payload: {
          titulo: query,
          proyectoId: context.projects[0]?.id,
          asignadoId: context.users[0]?.id,
        },
        confidence: 0.72,
      })
    }

    if (normalized.includes('proyecto')) {
      suggestions.push({
        entityType: AiEntityType.PROJECT,
        payload: {
          nombre: query,
          departamentoId: context.projects[0]?.departamento?.id,
        },
        confidence: 0.64,
      })
    }

    return suggestions
  }

  private async generateNarrative(query: string, context: SearchContext): Promise<string> {
    const fallback = this.buildDeterministicSummary(query, context)
    if (!this.geminiClient.isReady()) {
      return fallback
    }

    try {
      const prompt = `Actúa como asistente de proyectos.
Consulta: "${query}".
Resumen de contexto:
- Proyectos relevantes: ${JSON.stringify(context.projects)}
- Tareas relevantes: ${JSON.stringify(context.tasks)}
- Usuarios relevantes: ${JSON.stringify(context.users)}
- Documentos relevantes: ${JSON.stringify(context.documents)}

Responde en español con un párrafo breve, destacando riesgos y siguientes pasos.`

      const text = await this.geminiClient.generateText(prompt)
      return text?.length ? text : fallback
    } catch (error) {
      this.logger.warn(`Fallo al llamar a Gemini: ${error instanceof Error ? error.message : error}`)
      return fallback
    }
  }

  private buildDeterministicSummary(query: string, context: SearchContext): string {
    const parts: string[] = []
    parts.push(`Consulta "${query}" procesada.`)
    if (context.projects.length) {
      parts.push(`Encontré ${context.projects.length} proyectos relacionados, destacando "${context.projects[0].nombre}".`)
    }
    if (context.tasks.length) {
      parts.push(`Hay ${context.tasks.length} tareas que coinciden, la más relevante es "${context.tasks[0].titulo}".`)
    }
    if (context.users.length) {
      parts.push(`Identifiqué ${context.users.length} usuarios vinculados, incluyendo a ${context.users[0].nombreCompleto}.`)
    }
    if (context.documents.length) {
      parts.push(`La base de conocimiento aportó ${context.documents.length} documentos útiles.`)
    }
    return parts.join(' ')
  }

  private deriveProjectName(description: string): string {
    const sanitized = description.trim().split(/[\n\.]/).filter(Boolean)[0] ?? 'Proyecto asistido'
    const words = sanitized.split(' ').slice(0, 6).join(' ')
    return words.length > 3 ? words : `Proyecto asistido ${new Date().getFullYear()}`
  }

  private buildAssistStages(description: string): AiProjectAssistStageDto[] {
    const normalized = description.toLowerCase()
    const templates = [
      { name: 'Descubrimiento y Alcance', keywords: ['investig', 'descubr', 'alcance'], baseDuration: 5 },
      { name: 'Diseño / Arquitectura', keywords: ['dise', 'ux', 'arquitect'], baseDuration: 6 },
      { name: 'Implementación Técnica', keywords: ['desarroll', 'implement', 'build'], baseDuration: 10 },
      { name: 'Validación y QA', keywords: ['prueba', 'qa', 'testing'], baseDuration: 5 },
      { name: 'Lanzamiento y Adopción', keywords: ['lanz', 'deploy', 'adop'], baseDuration: 4 },
    ]

    const selected: AiProjectAssistStageDto[] = []
    for (const template of templates) {
      if (template.keywords.some((kw) => normalized.includes(kw))) {
        selected.push(this.stageFromTemplate(template))
      }
    }

    if (!selected.length) {
      selected.push(this.stageFromTemplate(templates[0]))
      selected.push(this.stageFromTemplate(templates[2]))
      selected.push(this.stageFromTemplate(templates[4]))
    }

    return selected.map((stage, index) => ({
      ...stage,
      durationDays: stage.durationDays + index, // ligera progresión
    }))
  }

  private stageFromTemplate(template: { name: string; baseDuration: number }): AiProjectAssistStageDto {
    const tasks: AiProjectAssistTaskDto[] = [
      {
        title: `${template.name}: planificación`,
        description: `Definir entregables y dependencias para ${template.name.toLowerCase()}.`,
      },
      {
        title: `${template.name}: ejecución`,
        description: `Dar seguimiento diario al avance de ${template.name.toLowerCase()}.`,
      },
    ]

    return {
      name: template.name,
      durationDays: template.baseDuration,
      tasks,
    }
  }

  private buildAssistRisks(
    dto: AiProjectAssistRequestDto,
    similarProjects: Array<{ estado: string | null; fechaFin: Date | null }>,
    stages: AiProjectAssistStageDto[],
  ): string[] {
    const risks: string[] = []

    if (!dto.departmentId) {
      risks.push('No se definió departamento responsable; asignar sponsor antes de iniciar.')
    }

    if (!dto.preferredMethodology) {
      risks.push('Metodología no especificada; acordar prácticas (Scrum/Kanban) con el equipo.')
    }

    if (stages.length > 4) {
      risks.push('Plan con múltiples etapas; validar capacidad de recursos para evitar cuellos de botella.')
    }

    const delayed = similarProjects.filter((p) => p.estado === 'En_Riesgo' || p.estado === 'Retrasado')
    if (delayed.length) {
      risks.push('Hay antecedentes de proyectos similares retrasados, establecer hitos de control adicionales.')
    }

    return risks.length ? risks : ['Sin riesgos relevantes detectados con la información actual.']
  }

  private buildAssistPrompt(
    description: string,
    stages: AiProjectAssistStageDto[],
    similarProjects: any[],
    risks: string[],
  ): string {
    return `Eres un PMO digital. Usuario describió: "${description}".
Proyectos similares: ${JSON.stringify(similarProjects)}.
Plan sugerido: ${JSON.stringify(stages)}.
Riesgos detectados: ${risks.join('; ')}.
Devuelve un resumen ejecutivo breve (<=120 palabras) en español destacando foco, hitos y alertas.`
  }

  private buildIdeaClusters(ideas: Array<any>): AiIdeaClusterDto[] {
    const clusterMap = new Map<string, { keywords: Set<string>; ideaIds: string[]; count: number }>()

    for (const idea of ideas) {
      const key = idea.categoria ?? 'General'
      if (!clusterMap.has(key)) {
        clusterMap.set(key, { keywords: new Set(), ideaIds: [], count: 0 })
      }
      const cluster = clusterMap.get(key)!
      cluster.count += 1
      cluster.ideaIds.push(idea.id)
      idea.tags?.slice(0, 5).forEach((tag: string) => cluster.keywords.add(tag))
    }

    return Array.from(clusterMap.entries()).map(([theme, data]) => ({
      theme,
      keywords: Array.from(data.keywords).slice(0, 4),
      ideaIds: data.ideaIds,
      summary: `Se detectaron ${data.count} ideas relacionadas con ${theme}.`,
    }))
  }

  private buildIdeaRecommendations(ideas: any[], clusters: AiIdeaClusterDto[]): string[] {
    const recommendations: string[] = []
    const avgScore =
      ideas.reduce((acc, idea) => acc + (typeof idea.aiScore === 'number' ? idea.aiScore : 0), 0) /
      Math.max(ideas.length, 1)

    if (avgScore > 70) {
      recommendations.push('Convertir las ideas con mayor AI Score en proyectos piloto durante el próximo trimestre.')
    }

    const largestCluster = clusters.reduce((prev, curr) => (curr.ideaIds.length > prev.ideaIds.length ? curr : prev), clusters[0])
    if (largestCluster) {
      recommendations.push(`Concentrar recursos en la temática "${largestCluster.theme}" por volumen de ideas.`)
    }

    if (!recommendations.length) {
      recommendations.push('Solicitar más detalles a los autores para enriquecer el análisis de IA.')
    }

    return recommendations
  }

  private buildIdeasPrompt(
    ideas: any[],
    clusters: AiIdeaClusterDto[],
    recommendations: string[],
  ): string {
    return `Analiza estas ideas (${ideas.length} registros) y sus clústeres ${JSON.stringify(clusters)}.
Entrega un resumen estratégico de máximo 120 palabras en español y resalta recomendaciones clave (${recommendations.join(
      '; ',
    )}).`
  }

  private async generateTextWithFallback(prompt: string, fallback: string): Promise<string> {
    if (!this.geminiClient.isReady()) {
      return fallback
    }

    try {
      const output = await this.geminiClient.generateText(prompt)
      return output && output.trim().length ? output : fallback
    } catch (error) {
      this.logger.warn(`Gemini fallback activado: ${error instanceof Error ? error.message : error}`)
      return fallback
    }
  }

  async submitSearchFeedback(dto: AiFeedbackDto, userId: string | null) {
    const queryLog = await this.prisma.aiQueryLog.findUnique({ where: { id: dto.queryId } })
    if (!queryLog) {
      throw new NotFoundException('No se encontró el historial de búsqueda indicado')
    }

    const existingMetadata = (queryLog.metadata as Record<string, any> | null) ?? {}
    const updatedMetadata = {
      ...existingMetadata,
      feedback: {
        useful: dto.useful,
        notes: dto.notes ?? null,
        submittedAt: new Date().toISOString(),
        submittedBy: userId,
      },
    }

    await this.prisma.aiQueryLog.update({
      where: { id: dto.queryId },
      data: {
        fueUtil: dto.useful,
        metadata: updatedMetadata,
      },
    })

    return {
      queryId: dto.queryId,
      useful: dto.useful,
    }
  }

  private async logQuery(params: {
    userId: string | null
    query: string
    status: string
    metadata?: Record<string, any>
  }): Promise<{ id: string }> {
    return this.prisma.aiQueryLog.create({
      data: {
        usuarioId: params.userId,
        consultaLenguajeNatural: params.query,
        estadoEjecucion: params.status,
        metadata: params.metadata,
      },
      select: { id: true },
    })
  }

  private chunkText(text: string, chunkSize = 800): string[] {
    if (!text) {
      return []
    }
    const normalized = text.replace(/\s+/g, ' ').trim()
    const chunks: string[] = []
    for (let i = 0; i < normalized.length; i += chunkSize) {
      chunks.push(normalized.slice(i, i + chunkSize))
    }
    return chunks
  }

  private async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.geminiClient.isReady()) {
      return null
    }
    return this.geminiClient.generateEmbedding(text)
  }

  private async upsertEmbeddingsForEntity(
    entityType: AiEntityType,
    entityId: string,
    text: string,
    source: string,
    metadata?: Record<string, any>,
    reset = false,
  ): Promise<number> {
    const chunks = this.chunkText(text)
    if (!chunks.length) {
      return 0
    }

    if (reset) {
      await this.prisma.aiEmbedding.deleteMany({ where: { entityType, entityId } })
    }

    let processed = 0
    for (const [index, chunk] of chunks.entries()) {
      const embedding = await this.generateEmbedding(chunk)
      await this.prisma.aiEmbedding.upsert({
        where: {
          entityType_entityId_chunkIndex: {
            entityType,
            entityId,
            chunkIndex: index,
          },
        },
        update: {
          chunkText: chunk,
          embedding: embedding ?? [],
          source,
          metadata,
        },
        create: {
          entityType,
          entityId,
          chunkIndex: index,
          chunkText: chunk,
          embedding: embedding ?? [],
          source,
          metadata,
        },
      })
      processed += 1
    }

    return processed
  }

  private async reindexByType(entityType: AiEntityType, entityId?: string) {
    const entities = await this.collectEntitiesForEmbedding(entityType, entityId)
    let processed = 0
    for (const entity of entities) {
      processed += await this.upsertEmbeddingsForEntity(
        entityType,
        entity.id,
        entity.text,
        entity.source,
        entity.metadata,
        true,
      )
    }
    return processed
  }

  private async collectEntitiesForEmbedding(
    entityType: AiEntityType,
    entityId?: string,
  ): Promise<Array<{ id: string; text: string; source: string; metadata?: Record<string, any> }>> {
    switch (entityType) {
      case AiEntityType.PROJECT: {
        const proyectos = await this.prisma.proyecto.findMany({
          where: {
            fechaEliminacion: null,
            ...(entityId ? { id: entityId } : {}),
          },
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            objetivos: true,
            estado: true,
            fechaInicio: true,
            fechaFin: true,
            departamento: { select: { id: true, nombre: true } },
            responsable: { select: { id: true, nombreCompleto: true } },
          },
        })

        return proyectos.map((proyecto) => ({
          id: proyecto.id,
          source: 'proyectos',
          metadata: {
            nombre: proyecto.nombre,
            estado: proyecto.estado,
            departamentoId: proyecto.departamento?.id ?? null,
            responsableId: proyecto.responsable?.id ?? null,
          },
          text: [
            `Proyecto ${proyecto.nombre}.`,
            proyecto.descripcion ?? '',
            `Objetivos: ${proyecto.objetivos ?? 'No definidos'}.`,
            `Estado actual: ${proyecto.estado}.`,
            `Departamento: ${proyecto.departamento?.nombre ?? 'Sin departamento'}.`,
            `Responsable: ${proyecto.responsable?.nombreCompleto ?? 'No asignado'}.`,
            `Fechas: ${proyecto.fechaInicio?.toISOString() ?? 'sin inicio'} - ${
              proyecto.fechaFin?.toISOString() ?? 'sin fin'
            }`,
          ]
            .filter(Boolean)
            .join(' '),
        }))
      }
      case AiEntityType.TASK: {
        const tareas = await this.prisma.tarea.findMany({
          where: {
            fechaEliminacion: null,
            ...(entityId ? { id: entityId } : {}),
          },
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            estado: true,
            prioridad: true,
            fechaVencimiento: true,
            proyecto: { select: { id: true, nombre: true } },
            asignado: { select: { id: true, nombreCompleto: true } },
          },
        })

        return tareas.map((tarea) => ({
          id: tarea.id,
          source: 'tareas',
          metadata: {
            titulo: tarea.titulo,
            estado: tarea.estado,
            prioridad: tarea.prioridad,
            proyectoId: tarea.proyecto?.id ?? null,
            asignadoId: tarea.asignado?.id ?? null,
          },
          text: [
            `Tarea ${tarea.titulo}.`,
            tarea.descripcion ?? '',
            `Estado: ${tarea.estado}. Prioridad: ${tarea.prioridad}.`,
            `Proyecto: ${tarea.proyecto?.nombre ?? 'Sin proyecto'}.`,
            `Asignado a: ${tarea.asignado?.nombreCompleto ?? 'Sin asignar'}.`,
            tarea.fechaVencimiento
              ? `Fecha de vencimiento: ${tarea.fechaVencimiento.toISOString()}.`
              : '',
          ]
            .filter(Boolean)
            .join(' '),
        }))
      }
      case AiEntityType.DOCUMENT: {
        const [docsProyecto, docsDepartamento] = await Promise.all([
          this.prisma.documentoProyecto.findMany({
            where: {
              ...(entityId ? { id: entityId } : {}),
            },
            select: {
              id: true,
              titulo: true,
              contenido: true,
              tipo: true,
              proyecto: { select: { nombre: true } },
            },
          }),
          this.prisma.documentoDepartamento.findMany({
            where: {
              ...(entityId ? { id: entityId } : {}),
            },
            select: {
              id: true,
              titulo: true,
              contenido: true,
              tipo: true,
              departamento: { select: { nombre: true } },
            },
          }),
        ])

        const mapDoc = (doc: any, source: string, parentName: string) => ({
          id: doc.id,
          source,
          metadata: {
            titulo: doc.titulo,
            tipo: doc.tipo,
          },
          text: [
            `Documento ${doc.titulo} (${doc.tipo}).`,
            parentName,
            doc.contenido ?? '',
          ]
            .filter(Boolean)
            .join(' '),
        })

        return [
          ...docsProyecto.map((doc) =>
            mapDoc(doc, 'documentos_proyecto', `Proyecto: ${doc.proyecto?.nombre ?? 'N/A'}`),
          ),
          ...docsDepartamento.map((doc) =>
            mapDoc(doc, 'documentos_departamento', `Departamento: ${doc.departamento?.nombre ?? 'N/A'}`),
          ),
        ]
      }
      case AiEntityType.USER: {
        const usuarios = await this.prisma.usuario.findMany({
          where: {
            fechaEliminacion: null,
            ...(entityId ? { id: entityId } : {}),
          },
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            rol: { select: { nombre: true } },
            biografia: true,
            departamentosACargo: { select: { nombre: true } },
          },
        })

        return usuarios.map((usuario) => ({
          id: usuario.id,
          source: 'usuarios',
          metadata: {
            nombre: usuario.nombreCompleto,
            email: usuario.email,
            rol: usuario.rol?.nombre ?? null,
          },
          text: [
            `Usuario ${usuario.nombreCompleto}.`,
            `Email: ${usuario.email}.`,
            usuario.rol?.nombre ? `Rol: ${usuario.rol.nombre}.` : '',
            usuario.departamentosACargo?.length
              ? `Departamentos a cargo: ${usuario.departamentosACargo
                  .map((d) => d.nombre)
                  .join(', ')}.`
              : '',
            usuario.biografia ?? '',
          ]
            .filter(Boolean)
            .join(' '),
        }))
      }
      case AiEntityType.IDEA: {
        const ideas = await this.prisma.idea.findMany({
          where: {
            ...(entityId ? { id: entityId } : {}),
          },
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            categoria: true,
            estado: true,
            aiScore: true,
            aiInsight: true,
            tags: true,
            autor: { select: { nombreCompleto: true } },
          },
        })

        return ideas.map((idea) => ({
          id: idea.id,
          source: 'ideas',
          metadata: {
            titulo: idea.titulo,
            categoria: idea.categoria,
            estado: idea.estado,
            aiScore: idea.aiScore ?? null,
          },
          text: [
            `Idea ${idea.titulo}.`,
            idea.descripcion,
            `Categoría: ${idea.categoria}. Estado: ${idea.estado}.`,
            idea.aiInsight ? `Insight IA: ${idea.aiInsight}.` : '',
            idea.aiScore ? `Puntaje IA: ${idea.aiScore}.` : '',
            idea.tags?.length ? `Tags: ${idea.tags.join(', ')}.` : '',
            idea.autor ? `Autor: ${idea.autor.nombreCompleto}.` : '',
          ]
            .filter(Boolean)
            .join(' '),
        }))
      }
      case AiEntityType.DEPARTMENT: {
        const departamentos = await this.prisma.departamento.findMany({
          where: {
            ...(entityId ? { id: entityId } : {}),
          },
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            objetivos: true,
            color: true,
            contextoDepartamento: {
              select: {
                funciones: true,
                responsabilidades: true,
                procesosClave: true,
                objetivos: true,
                kpis: true,
              },
            },
          },
        })

        return departamentos.map((dept) => ({
          id: dept.id,
          source: 'departamentos',
          metadata: {
            nombre: dept.nombre,
            color: dept.color,
          },
          text: [
            `Departamento ${dept.nombre}.`,
            dept.descripcion ?? '',
            dept.objetivos ? `Objetivos: ${dept.objetivos}.` : '',
            dept.contextoDepartamento?.funciones
              ? `Funciones clave: ${dept.contextoDepartamento.funciones}.`
              : '',
            dept.contextoDepartamento?.responsabilidades
              ? `Responsabilidades: ${dept.contextoDepartamento.responsabilidades}.`
              : '',
            dept.contextoDepartamento?.procesosClave
              ? `Procesos clave: ${dept.contextoDepartamento.procesosClave}.`
              : '',
            dept.contextoDepartamento?.kpis
              ? `KPIs: ${dept.contextoDepartamento.kpis}.`
              : '',
          ]
            .filter(Boolean)
            .join(' '),
        }))
      }
      case AiEntityType.KNOWLEDGE: {
        const contextos = await this.prisma.contextoOrganizacional.findMany({
          where: {
            ...(entityId ? { id: entityId } : {}),
          },
          select: {
            id: true,
            mision: true,
            vision: true,
            objetivosEstrategicos: true,
            descripcionGeneral: true,
            industria: true,
            tamanoEmpresa: true,
            valoresEmpresariales: true,
          },
        })

        return contextos.map((ctx) => ({
          id: ctx.id,
          source: 'contexto_organizacional',
          metadata: {
            industria: ctx.industria,
            tamanoEmpresa: ctx.tamanoEmpresa,
          },
          text: [
            ctx.descripcionGeneral ?? '',
            ctx.mision ? `Misión: ${ctx.mision}.` : '',
            ctx.vision ? `Visión: ${ctx.vision}.` : '',
            ctx.objetivosEstrategicos
              ? `Objetivos estratégicos: ${ctx.objetivosEstrategicos}.`
              : '',
            ctx.valoresEmpresariales ? `Valores: ${ctx.valoresEmpresariales}.` : '',
            ctx.industria ? `Industria: ${ctx.industria}.` : '',
            ctx.tamanoEmpresa ? `Tamaño de empresa: ${ctx.tamanoEmpresa}.` : '',
          ]
            .filter(Boolean)
            .join(' '),
        }))
      }
      default:
        return []
    }
  }
}
