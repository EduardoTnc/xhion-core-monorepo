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
