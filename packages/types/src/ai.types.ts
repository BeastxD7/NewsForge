export type AIProvider = "ANTHROPIC" | "AZURE_OPENAI" | "GROQ" | "OPENROUTER"

export interface AIConfig {
  id: string
  provider: AIProvider
  model: string
  temperature: number
  maxTokens: number
  baseUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateAIConfigDto {
  provider?: AIProvider
  model?: string
  temperature?: number
  maxTokens?: number
  baseUrl?: string
}

// ─── Available models per provider ───────────────────────────────────────────

export const AI_PROVIDER_MODELS: Record<AIProvider, Array<{ id: string; label: string }>> = {
  ANTHROPIC: [
    { id: "claude-opus-4-6",    label: "Claude Opus 4.6" },
    { id: "claude-sonnet-4-6",  label: "Claude Sonnet 4.6 (recommended)" },
    { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  ],
  GROQ: [
    { id: "llama-3.3-70b-versatile",  label: "Llama 3.3 70B Versatile" },
    { id: "llama-3.1-8b-instant",     label: "Llama 3.1 8B Instant" },
    { id: "mixtral-8x7b-32768",       label: "Mixtral 8x7B" },
    { id: "gemma2-9b-it",             label: "Gemma 2 9B" },
  ],
  OPENROUTER: [
    { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
    { id: "google/gemini-flash-1.5",           label: "Gemini Flash 1.5" },
    { id: "mistralai/mistral-large",           label: "Mistral Large" },
    { id: "openai/gpt-4o",                     label: "GPT-4o (via OpenRouter)" },
  ],
  AZURE_OPENAI: [
    { id: "gpt-4o",       label: "GPT-4o" },
    { id: "gpt-4o-mini",  label: "GPT-4o Mini" },
    { id: "gpt-4-turbo",  label: "GPT-4 Turbo" },
  ],
}

export const AI_PROVIDER_LABELS: Record<AIProvider, string> = {
  ANTHROPIC:    "Anthropic (Claude)",
  AZURE_OPENAI: "Azure OpenAI",
  GROQ:         "Groq",
  OPENROUTER:   "OpenRouter",
}
