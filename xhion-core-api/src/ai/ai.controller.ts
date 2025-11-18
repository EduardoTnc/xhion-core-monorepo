import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PermissionsGuard } from '../auth/permissions.guard'
import { RequiresPermission } from '../auth/permissions.decorator'
import { Auditar } from '../auditoria/auditar.decorator'
import { AiService } from './ai.service'
import {
  AiIdeasAnalyzeRequestDto,
  AiIdeasAnalyzeResponseDto,
  AiLogFilterDto,
  AiProjectAssistRequestDto,
  AiProjectAssistResponseDto,
  AiReindexRequestDto,
  AiSearchQueryDto,
  AiSearchResultDto,
} from './dto/ai-search.dto'

@ApiTags('Inteligencia Artificial')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('search')
  @RequiresPermission('ai.search')
  @Auditar('AI - Búsqueda contextual')
  @ApiOperation({ summary: 'Buscar en lenguaje natural con IA' })
  @ApiResponse({ status: 200, type: AiSearchResultDto })
  async search(@Body() dto: AiSearchQueryDto, @Request() req) {
    const userId: string | null = req.user?.id ?? null
    return this.aiService.search(dto, userId)
  }

  @Post('reindex')
  @RequiresPermission('ai.reindex')
  @Auditar('AI - Reindexar embeddings')
  @ApiOperation({ summary: 'Reconstruir embeddings de entidades' })
  async reindex(@Body() dto: AiReindexRequestDto) {
    return this.aiService.reindexKnowledgeBase(dto)
  }

  @Post('projects/assist')
  @RequiresPermission('ai.projects.assist')
  @Auditar('AI - Asistencia creación de proyectos')
  @ApiOperation({ summary: 'Generar propuesta de proyecto asistida por IA' })
  @ApiResponse({ status: 200, type: AiProjectAssistResponseDto })
  async assistProject(@Body() dto: AiProjectAssistRequestDto, @Request() req): Promise<AiProjectAssistResponseDto> {
    const userId: string | null = req.user?.id ?? null
    return this.aiService.assistProject(dto, userId)
  }

  @Post('ideas/analyze')
  @RequiresPermission('ai.ideas.analyze')
  @Auditar('AI - Análisis estratégico de ideas')
  @ApiOperation({ summary: 'Analizar ideas recientes y generar insights' })
  @ApiResponse({ status: 200, type: AiIdeasAnalyzeResponseDto })
  async analyzeIdeas(@Body() dto: AiIdeasAnalyzeRequestDto): Promise<AiIdeasAnalyzeResponseDto> {
    return this.aiService.analyzeIdeas(dto)
  }

  @Get('logs')
  @RequiresPermission('ai.logs')
  @ApiOperation({ summary: 'Listar logs de consultas IA' })
  async getLogs(@Query() query: AiLogFilterDto) {
    return this.aiService.listQueryLogs(query.take ?? 20)
  }

  @Get('status')
  @RequiresPermission('ai.status')
  @ApiOperation({ summary: 'Obtener estado del módulo IA' })
  async getStatus() {
    return this.aiService.getStatus()
  }
}
