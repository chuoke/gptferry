export interface IChatOptions {
  message: string;
  model: string;
  api_base_url: string;
  api_key: string;
  carries: { role: string; content: string }[];
  system_prompt: string;
  probability_mass?: number;
  onUpdate: (content: string, options: { done: boolean }) => void;
}
