export interface IPrompt {
  act: string;
  prompt: string;
}

const prompts = reactive<IPrompt[]>([
  {
    act: "翻译",
    prompt:
      "你作为翻译，你的目标是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。",
  },
]);

export const usePrompts = () => {
  //

  return {
    prompts,
  };
};
