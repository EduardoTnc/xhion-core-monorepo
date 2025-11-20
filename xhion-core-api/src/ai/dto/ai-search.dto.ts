import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  IsDateString,
} from 'class-validator'
import { AiEntityType } from '@prisma/client'

export class AiSearchQueryDto {
  @ApiProperty({ description: 'Consulta en lenguaje natural ingresada por el usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  query!: string

  @ApiProperty({ required: false, description: 'Contexto adicional para la consulta (departamento, filtros, etc.)' })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>
}

export enum AiSearchIntent {
  QUERY = 'query',
  COMMAND = 'command',
  INSIGHT = 'insight',
}

export class AiActionSuggestionDto {
  @ApiProperty({ enum: AiEntityType })
  @IsEnum(AiEntityType)
  entityType!: AiEntityType

  @ApiProperty({ description: 'Payload sugerido para crear o actualizar la entidad', type: Object })
  @IsObject()
  payload!: Record<string, any>

  @ApiProperty({ description: 'Nivel de confianza de la sugerencia (0-1)', example: 0.72 })
  @IsNumber()
  confidence!: number
}

export class AiSearchResultDto {
  @ApiProperty({ description: 'Identificador del log asociado a esta consulta' })
  @IsString()
  queryId!: string

  @ApiProperty({ description: 'Resumen narrativo generado por la IA' })
  @IsString()
  summary!: string

  @ApiProperty({ description: 'Listado de resultados por entidad', type: Object })
  @IsObject()
  resultsByEntity!: Record<string, any[]>

  @ApiProperty({ description: 'Intención detectada en la consulta', enum: AiSearchIntent })
  @IsEnum(AiSearchIntent)
  intent!: AiSearchIntent

  @ApiProperty({ type: [AiActionSuggestionDto], required: false })
  @IsOptional()
  @IsArray()
  actionSuggestions?: AiActionSuggestionDto[]

  @ApiProperty({ description: 'Tiempo total de procesamiento en milisegundos' })
  @IsNumber()
  processingTimeMs!: number
}

export class AiFeedbackDto {
  @ApiProperty({ description: 'Identificador del log (queryId) devuelto por la búsqueda' })
  @IsString()
  @IsNotEmpty()
  queryId!: string

  @ApiProperty({ description: 'Indica si el resultado fue útil para el usuario' })
  @IsBoolean()
  useful!: boolean

  @ApiProperty({ required: false, description: 'Comentario adicional del usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}

export class AiReindexRequestDto {
  @ApiProperty({ enum: AiEntityType, required: false })
  @IsOptional()
  @IsEnum(AiEntityType)
  entityType?: AiEntityType

  @ApiProperty({ required: false, description: 'ID específico a reconstruir' })
  @IsOptional()
  @IsUUID()
  entityId?: string

  @ApiProperty({ required: false, description: 'Forzar reindexación completa' })
  @IsOptional()
  @IsBoolean()
  full?: boolean
}

export class AiLogFilterDto {
  @ApiProperty({ required: false, description: 'Cantidad máxima de registros', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number
}

export class AiProjectAssistRequestDto {
  @ApiProperty({ description: 'Descripción libre del proyecto que el usuario desea crear' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string

  @ApiProperty({ required: false, description: 'Departamento objetivo' })
  @IsOptional()
  @IsUUID()
  departmentId?: string

  @ApiProperty({ required: false, description: 'Fecha objetivo sugerida por el usuario' })
  @IsOptional()
  @IsDateString()
  targetDate?: string

  @ApiProperty({ required: false, description: 'Metodología o enfoque preferido (ágil, cascada, etc.)' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  preferredMethodology?: string
}

export class AiProjectAssistTaskDto {
  @ApiProperty()
  @IsString()
  title!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assigneeHint?: string
}

export class AiProjectAssistStageDto {
  @ApiProperty()
  @IsString()
  name!: string

  @ApiProperty()
  @IsNumber()
  durationDays!: number

  @ApiProperty({ type: [AiProjectAssistTaskDto] })
  @IsArray()
  tasks!: AiProjectAssistTaskDto[]
}

export class AiProjectAssistResponseDto {
  @ApiProperty()
  @IsString()
  summary!: string

  @ApiProperty({ description: 'Confianza estimada (0-1)' })
  @IsNumber()
  confidence!: number

  @ApiProperty({ description: 'Payload sugerido para crear el proyecto', type: Object })
  @IsObject()
  suggestedProject!: Record<string, any>

  @ApiProperty({ type: [AiProjectAssistStageDto] })
  @IsArray()
  stages!: AiProjectAssistStageDto[]

  @ApiProperty({ type: [String] })
  @IsArray()
  risks!: string[]
}

export class AiIdeasAnalyzeRequestDto {
  @ApiProperty({ required: false, description: 'Número máximo de ideas a analizar', default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  limit?: number

  @ApiProperty({ required: false, description: 'Ventana de días hacia atrás para incluir ideas', default: 45 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  windowDays?: number
}

export class AiIdeaClusterDto {
  @ApiProperty()
  @IsString()
  theme!: string

  @ApiProperty({ type: [String] })
  @IsArray()
  keywords!: string[]

  @ApiProperty({ type: [String] })
  @IsArray()
  ideaIds!: string[]

  @ApiProperty()
  @IsString()
  summary!: string
}

export class AiIdeasAnalyzeResponseDto {
  @ApiProperty()
  @IsString()
  summary!: string

  @ApiProperty({ type: [AiIdeaClusterDto] })
  @IsArray()
  clusters!: AiIdeaClusterDto[]

  @ApiProperty({ type: [String] })
  @IsArray()
  strategicRecommendations!: string[]
}
