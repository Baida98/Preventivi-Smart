/**
 * LLM Provider — Multi-Provider Router
 * Supporta HuggingFace, Groq, OpenRouter e Google Gemini.
 */

export const PROVIDERS = {
  HF: "huggingface",
  GROQ: "groq",
  OPENROUTER: "openrouter",
  GEMINI: "gemini",
} as const;

export type Provider = typeof PROVIDERS[keyof typeof PROVIDERS];

const ENDPOINTS = {
  [PROVIDERS.HF]: "https://router.huggingface.co/v1/chat/completions",
  [PROVIDERS.GROQ]: "https://api.groq.com/openai/v1/chat/completions",
  [PROVIDERS.OPENROUTER]: "https://openrouter.ai/api/v1/chat/completions",
  [PROVIDERS.GEMINI]: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
};

export const MODELS = {
  [PROVIDERS.HF]: {
    smart: "Qwen/Qwen2.5-72B-Instruct",
    fast: "mistralai/Mistral-Nemo-Instruct-2407",
    deep: "meta-llama/Llama-3.3-70B-Instruct",
  },
  [PROVIDERS.GROQ]: {
    smart: "llama-3.3-70b-versatile",
    fast: "llama-3.1-8b-instant",
    deep: "deepseek-r1-distill-llama-70b",
  },
  [PROVIDERS.OPENROUTER]: {
    smart: "google/gemini-2.0-flash-001",
    fast: "meta-llama/llama-3.3-70b-instruct",
    deep: "deepseek/deepseek-r1",
  },
  [PROVIDERS.GEMINI]: {
    smart: "gemini-2.0-flash",
    fast: "gemini-2.0-flash-lite",
    deep: "gemini-1.5-pro",
  },
};

const STORAGE_KEYS = {
  TOKEN: "preventivi_ai_token",
  PROVIDER: "preventivi_ai_provider",
};

export const llmKeys = {
  getToken: (): string => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) ?? "";
  },
  getProvider: (): Provider => {
    return (localStorage.getItem(STORAGE_KEYS.PROVIDER) as Provider) ?? PROVIDERS.HF;
  },
  setCredentials: (token: string, provider: Provider): void => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
  },
  hasToken: (): boolean => !!llmKeys.getToken(),
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.PROVIDER);
  },
};

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export async function callLLM(
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<string> {
  const token = llmKeys.getToken();
  const provider = llmKeys.getProvider();
  
  if (!token) throw new Error("AI non configurata. Inserisci una chiave API nel setup.");

  const providerModels = MODELS[provider] || MODELS[PROVIDERS.HF];
  const model = options.model || providerModels.smart;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 2048,
    stream: false,
  };

  if (options.jsonMode && provider !== PROVIDERS.HF) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(ENDPOINTS[provider], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(provider === PROVIDERS.OPENROUTER ? {
        "HTTP-Referer": window.location.origin,
        "X-Title": "Preventivi Smart",
      } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: { message: "Errore sconosciuto" } }));
    throw new Error(errData.error?.message || `Errore ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

export async function streamLLM(
  messages: LLMMessage[],
  onChunk: (chunk: string) => void,
  options: LLMOptions = {}
): Promise<string> {
  const token = llmKeys.getToken();
  const provider = llmKeys.getProvider();

  if (!token) throw new Error("AI non configurata.");

  const providerModels = MODELS[provider] || MODELS[PROVIDERS.HF];
  const model = options.model || providerModels.fast;

  const response = await fetch(ENDPOINTS[provider], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.5,
      max_tokens: options.maxTokens ?? 1500,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Errore streaming ${response.status}`);
  }

  if (!response.body) throw new Error("Nessun body nella risposta.");

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
}
