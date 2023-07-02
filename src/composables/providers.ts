export interface IProvider {
  key: string;
  name: string;
  avatar: string;
  api_base_url: string;
  api_version: string;
  homepage?: string;
  models: IProviderModel[];
}

export interface IProviderModel {
  value: string;
  label: string;
  max_token: number;
  description: string;
}

const providers: IProvider[] = [
  {
    key: "chatgpt",
    name: "ChatGPT",
    avatar: "/providers/chatgpt/logo.png",
    api_base_url: "https://api.openai.com",
    api_version: "v1",
    homepage: "http://openai.com",
    models: [
      {
        value: "gpt-4",
        label: "gpt-4",
        max_token: 8192,
        description:
          "More capable than any GPT-3.5 model, able to do more complex tasks, and optimized for chat. Will be updated with our latest model iteration.",
      },
      {
        value: "gpt-4-32k",
        label: "gpt-4-32k",
        max_token: 32768,
        description:
          "Same capabilities as the base gpt-4 mode but with 4x the context length. Will be updated with our latest model iteration.",
      },
      {
        value: "gpt-3.5-turbo",
        label: "gpt-3.5-turbo",
        max_token: 4096,
        description:
          "Most capable GPT-3.5 model and optimized for chat at 1/10th the cost of text-davinci-003. Will be updated with our latest model iteration.",
      },
      {
        value: "gpt-3.5-turbo-16k",
        label: "gpt-3.5-turbo-16k",
        max_token: 16384,
        description:
          "Same capabilities as the standard gpt-3.5-turbo model but with 4 times the context.",
      },
    ],
  },
];

export const useProviders = (): {
  providers: IProvider[];
  find: (key: string) => IProvider | undefined;
} => {
  function find(key: string): IProvider | undefined {
    return providers.find((provider) => provider.key === key);
  }

  return {
    providers,
    find,
  };
};
