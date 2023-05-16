import openai from "@/ai/openai";
import type { IChatOptions } from "@/ai/types";

export const useAI = (
  provider: string
): {
  chat: (options: IChatOptions) => Promise<void>;
} => {
  if (provider === "chatgpt") {
    return openai();
  }

  throw new Error("服务提供者为适配");
};
