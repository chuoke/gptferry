import { isNumber, pickBy } from "lodash-es";
import type { IChatOptions } from "./types";

function userPrompt(input: string) {
  return `\n\nHuman: ${input}`;
}
function assistantPrompt(input: string) {
  return `\n\nAssistant: ${input}`;
}

export default (): {
  chat: (options: IChatOptions) => Promise<void>;
} => {
  const baseApiUrl = "https://api.anthropic.com";

  function buildParams(options: IChatOptions) {
    let prompt = '';

    if (options.system_prompt) {
      prompt += userPrompt(options.system_prompt);
    }

    prompt +=
      (options.carries || []).reduce((carry, item) => {
        return carry + (item.role === 'user' ? userPrompt(item.content) : assistantPrompt(item.content));
      }, '')
      + userPrompt(options.message)
      + assistantPrompt('');

    return pickBy(
      {
        model: options.model,
        prompt,
        stream: true,
        max_tokens_to_sample: options.max_tokens,
        temperature:
          "probability_mass" in options && isNumber(options.probability_mass)
            ? options.probability_mass
            : 1,
      },
      (val) => val !== undefined
    );
  }

  async function chat(options: IChatOptions) {
    if (!options.api_key) {
      throw new Error("请提供有效的 API KEY");
    }

    const params = buildParams(options);

    try {
      const response = await fetch(
        (options.api_base_url || baseApiUrl) + "/v1/complete",
        {
          method: "POST",
          body: JSON.stringify(params),
          headers: {
            "Content-Type": "application/json",
            "x-api-key": options.api_key,
            "anthropic-version": "2023-06-01",
          },
          signal: options.controller?.signal,
        }
      );

      const stream = response.body;
      console.log({ response });
      if (!stream) {
        throw new Error("Unknown Error");
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder("utf-8");
      function readStream() {
        reader
          .read()
          .then(({ done, value }) => {
            console.log({ done, value });
            if (done) {
              options.onProgress("", { done: true });
              return;
            }

            const text = decoder.decode(value, { stream: true });
            if (text.startsWith("{")) {
              const data = JSON.parse(text);
              console.log({ data });
              if (data && data.error) {
                throw new Error(data.error.message);
              }

              options.onProgress(data.completion || '', { done: data.stop_reason !== null });
            }

            readStream();
          })
          .catch((err) => {
            console.log({ err });
            options.onError && options.onError(err);
          });
      }

      readStream();
    } catch (err) {
      throw err;
    }
  }

  return {
    chat,
  };
};
