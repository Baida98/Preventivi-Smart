/**
 * LLM Provider — HuggingFace Router (OpenAI-compatible)
 *
 * Adattato dal progetto AI (Baida98/AI) per Preventivi-Smart.
 * Usa il router HF per accedere a modelli top-tier gratuitamente.
 *
 * Modelli disponibili:
 *   smart → Qwen/Qwen2.5-72B-Instruct  (ottimo per italiano strutturato)
 *   fast  → mistralai/Mistral-Nemo-Instruct-2407  (veloce per chat)
 *   deep  → meta-llama/Llama-3.3-70B-Instruct  (deep reasoning)
 */

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";

export const HF_MODELS = {
  smart: "Qwen/Qwen2.5-72B-Instruct",
  fast: "mistralai/Mistral-Nemo-Instruct-2407",
  deep: "meta-llama/Llama-3.3-70B-Instruct",
} as const;

const TOKEN_KEY = "preventivi_hf_token";

export const llmKeys = {
  getToken: (): string => {
    const envToken = import.meta.env.VITE_HF_TOKEN as string | undefined;
    if (envToken) return envToken;
    try {
      return localStorage.getItem(TOKEN_KEY) ?? "";
    } catch {
      return "";
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch { /* ignore */ }
  },
  hasToken: (): boolean => !!llmKeys.getToken(),
  clearToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch { /* ignore */ }
  },
};

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMOptions {
  model?: keyof typeof HF_MODELS | string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Chiama LLM e ritorna risposta completa (non-streaming).
 */
export async function callLLM(
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<string> {
  const token = llmKeys.getToken();
  if (!token) throw new Error("Token HuggingFace non configurato.");

  const model =
    options.model && options.model in HF_MODELS
      ? HF_MODELS[options.model as keyof typeof HF_MODELS]
      : (options.model ?? HF_MODELS.smart);

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 2048,
    stream: false,
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(HF_ROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`LLM Error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}

/**
 * Chiama LLM in streaming — onChunk viene chiamato per ogni frammento.
 */
export async function streamLLM(
  messages: LLMMessage[],
  onChunk: (chunk: string) => void,
  options: LLMOptions = {}
): Promise<string> {
  const token = llmKeys.getToken();
  if (!token) throw new Error("Token HuggingFace non configurato.");

  const model =
    options.model && options.model in HF_MODELS
      ? HF_MODELS[options.model as keyof typeof HF_MODELS]
      : (options.model ?? HF_MODELS.fast);

  const response = await fetch(HF_ROUTER_URL, {
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
    const errText = await response.text().catch(() => "");
    throw new Error(`LLM Error ${response.status}: ${errText.slice(0, 200)}`);
  }

  if (!response.body) throw new Error("Nessun body nella risposta streaming.");

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
          const data = JSON.parse(line.slice(6)) as {
            choices: Array<{ delta: { content?: string } }>;
          };
          const content = data.choices[0]?.delta?.content ?? "";
          if (content) {
            fullContent += content;
            onChunk(content);
          }
        } catch { /* chunk incompleto */ }
      }
    }
  }

  return fullContent;
}
