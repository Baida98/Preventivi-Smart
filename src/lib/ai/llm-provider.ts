/**
 * LLM Provider — Intelligent Auto-Fallback Router
 * Tenta i provider in ordine di potenza e disponibilità.
 */

export const PROVIDERS = {
  GEMINI: "gemini",
  GROQ: "groq",
  OPENROUTER: "openrouter",
  HF: "huggingface",
} as const;

export type Provider = typeof PROVIDERS[keyof typeof PROVIDERS];

const ENDPOINTS = {
  [PROVIDERS.GEMINI]: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  [PROVIDERS.GROQ]: "https://api.groq.com/openai/v1/chat/completions",
  [PROVIDERS.OPENROUTER]: "https://openrouter.ai/api/v1/chat/completions",
  [PROVIDERS.HF]: "https://router.huggingface.co/v1/chat/completions",
};

export const MODELS = {
  gemini: { smart: "gemini-2.0-flash", fast: "gemini-2.0-flash-lite" },
  groq: { smart: "llama-3.3-70b-versatile", fast: "llama-3.1-8b-instant" },
  openrouter: { smart: "google/gemini-2.0-flash-001", fast: "meta-llama/llama-3.3-70b-instruct" },
  huggingface: { smart: "Qwen/Qwen2.5-72B-Instruct", fast: "mistralai/Mistral-Nemo-Instruct-2407" },
} as const;

const STORAGE_KEY_PREFIX = "preventivi_ai_token_";

export const llmKeys = {
  getToken: (p: Provider): string => localStorage.getItem(STORAGE_KEY_PREFIX + p) ?? "",
  setToken: (p: Provider, token: string): void => localStorage.setItem(STORAGE_KEY_PREFIX + p, token),
  hasAnyToken: (): boolean => Object.values(PROVIDERS).some(p => !!llmKeys.getToken(p)),
  hasToken: (): boolean => Object.values(PROVIDERS).some(p => !!llmKeys.getToken(p)),
  getAllTokens: () => {
    const tokens: Record<string, string> = {};
    Object.values(PROVIDERS).forEach(p => {
      const t = llmKeys.getToken(p);
      if (t) tokens[p] = t;
    });
    return tokens;
  }
};

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Chiama LLM con sistema di fallback automatico.
 * Tenta i provider in ordine: Gemini -> Groq -> OpenRouter -> HF
 */
export async function callLLM(
  messages: LLMMessage[],
  options: { model?: string; temperature?: number; jsonMode?: boolean; maxTokens?: number } = {}
): Promise<string> {
  const tokens = llmKeys.getAllTokens();
  const order: Provider[] = [PROVIDERS.GEMINI, PROVIDERS.GROQ, PROVIDERS.OPENROUTER, PROVIDERS.HF];
  
  let lastError = "Nessuna chiave API configurata.";

  for (const provider of order) {
    const token = tokens[provider];
    if (!token) continue;

    try {
      const model = options.model || (MODELS as any)[provider].smart;
      const body: any = {
        model,
        messages,
        temperature: options.temperature ?? 0.2,
        stream: false,
        ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
      };

      if (options.jsonMode && provider !== PROVIDERS.HF) {
        body.response_format = { type: "json_object" };
      }

      const response = await fetch(ENDPOINTS[provider], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(provider === PROVIDERS.OPENROUTER ? { "HTTP-Referer": window.location.origin, "X-Title": "Preventivi Smart" } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Status ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content ?? "";
    } catch (e: any) {
      console.warn(`Fallback: ${provider} fallito, provo il prossimo...`, e.message);
      lastError = `${provider}: ${e.message}`;
    }
  }

  throw new Error(`Tutti i provider hanno fallito. Ultimo errore: ${lastError}`);
}

/**
 * Streaming con fallback (più complesso, tenta il primo disponibile)
 */
export async function streamLLM(
  messages: LLMMessage[],
  onChunk: (chunk: string) => void,
  options: { model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const tokens = llmKeys.getAllTokens();
  const order: Provider[] = [PROVIDERS.GEMINI, PROVIDERS.GROQ, PROVIDERS.OPENROUTER, PROVIDERS.HF];

  for (const provider of order) {
    const token = tokens[provider];
    if (!token) continue;

    try {
      const model = options.model || (MODELS as any)[provider].fast;
      const response = await fetch(ENDPOINTS[provider], {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          model, 
          messages, 
          temperature: options.temperature ?? 0.5, 
          stream: true,
          ...(options.maxTokens ? { max_tokens: options.maxTokens } : {})
        }),
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      if (!response.body) throw new Error("No body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content ?? "";
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch { /* skip */ }
          }
        }
      }
      return fullContent;
    } catch (e) {
      console.warn(`Fallback streaming fallito per ${provider}`);
    }
  }
  throw new Error("Nessun provider disponibile per lo streaming.");
}
