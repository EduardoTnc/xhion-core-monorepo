import { Logger } from '@nestjs/common'
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import { createHash } from 'crypto'

interface GeminiClientOptions {
  textModelName: string
  embeddingModelName: string
  cacheTtlMs?: number
  breakerThreshold?: number
  breakerCooldownMs?: number
}

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class GeminiClient {
  private readonly genAI?: GoogleGenerativeAI
  private textModel?: GenerativeModel
  private embeddingModel?: GenerativeModel
  private readonly cacheTtlMs: number
  private readonly breakerThreshold: number
  private readonly breakerCooldownMs: number
  private readonly textCache = new Map<string, CacheEntry<string | null>>()
  private readonly embeddingCache = new Map<string, CacheEntry<number[] | null>>()
  private consecutiveFailures = 0
  private breakerOpenUntil = 0

  constructor(
    private readonly logger: Logger,
    apiKey: string | undefined,
    private readonly options: GeminiClientOptions,
  ) {
    this.cacheTtlMs = options.cacheTtlMs ?? 30_000
    this.breakerThreshold = Math.max(options.breakerThreshold ?? 3, 1)
    this.breakerCooldownMs = options.breakerCooldownMs ?? 60_000

    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.textModel = this.genAI.getGenerativeModel({ model: options.textModelName })
      this.embeddingModel = this.genAI.getGenerativeModel({ model: options.embeddingModelName })
    } else {
      this.logger.warn('[GeminiClient] GEMINI_API_KEY no configurada. Operando en modo determinístico.')
    }
  }

  isReady() {
    return Boolean(this.genAI)
  }

  async generateText(prompt: string): Promise<string | null> {
    if (!this.textModel || this.isBreakerOpen()) {
      return null
    }

    const cacheKey = this.hash(`text:${prompt}`)
    const cached = this.getCache(this.textCache, cacheKey)
    if (cached !== undefined) {
      return cached
    }

    try {
      const result = await this.textModel.generateContent(prompt)
      const text = result.response.text()?.trim() ?? null
      this.setCache(this.textCache, cacheKey, text)
      this.resetBreaker()
      return text
    } catch (error) {
      this.logger.warn(`GeminiClient.generateText error: ${error instanceof Error ? error.message : error}`)
      this.recordFailure()
      return null
    }
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.embeddingModel || this.isBreakerOpen()) {
      return null
    }

    const cacheKey = this.hash(`embedding:${text}`)
    const cached = this.getCache(this.embeddingCache, cacheKey)
    if (cached !== undefined) {
      return cached
    }

    try {
      const response = await this.embeddingModel.embedContent(text)
      const vector = response.embedding?.values ?? null
      this.setCache(this.embeddingCache, cacheKey, vector)
      this.resetBreaker()
      return vector
    } catch (error) {
      this.logger.warn(`GeminiClient.generateEmbedding error: ${error instanceof Error ? error.message : error}`)
      this.recordFailure()
      return null
    }
  }

  private hash(value: string) {
    return createHash('sha1').update(value).digest('hex')
  }

  private getCache<T>(store: Map<string, CacheEntry<T | null>>, key: string): T | null | undefined {
    const entry = store.get(key)
    if (!entry) {
      return undefined
    }

    if (entry.expiresAt < Date.now()) {
      store.delete(key)
      return undefined
    }

    return entry.value
  }

  private setCache<T>(store: Map<string, CacheEntry<T | null>>, key: string, value: T | null) {
    store.set(key, {
      value,
      expiresAt: Date.now() + this.cacheTtlMs,
    })
  }

  private isBreakerOpen() {
    if (this.breakerOpenUntil === 0) {
      return false
    }

    if (Date.now() > this.breakerOpenUntil) {
      this.resetBreaker()
      return false
    }

    return true
  }

  private recordFailure() {
    this.consecutiveFailures += 1
    if (this.consecutiveFailures >= this.breakerThreshold) {
      this.breakerOpenUntil = Date.now() + this.breakerCooldownMs
      this.logger.error(
        `[GeminiClient] Circuit breaker activado por ${this.consecutiveFailures} fallos consecutivos. Se reintentará en ${this.breakerCooldownMs / 1000}s`,
      )
    }
  }

  private resetBreaker() {
    this.consecutiveFailures = 0
    this.breakerOpenUntil = 0
  }
}
