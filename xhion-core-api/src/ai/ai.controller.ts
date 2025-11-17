import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PermissionsGuard } from '../auth/permissions.guard'
import { RequiresPermission } from '../auth/permissions.decorator'
import { Auditar } from '../auditoria/auditar.decorator'
import { AiService } from './ai.service'
import { AiLogFilterDto, AiReindexRequestDto, AiSearchQueryDto, AiSearchResultDto } from './dto/ai-search.dto'

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
