import { isNumber } from "lodash-es";
import type { IChatOptions } from "./types";

export default (): {
  chat: (options: IChatOptions) => Promise<void>;
} => {
  const baseApiUrl = "https://api.openai.com";

  function buildParams(options: IChatOptions) {
    const messages = [
      ...(options.carries || []).map((item) => {
        return { role: item.role, content: item.content };
      }),
      {
        content: options.message,
        role: "user",
      },
    ];

    if (options.system_prompt) {
      messages.unshift({
        role: "system",
        content: options.system_prompt,
      });
    }

    return {
      model: options.model,
      messages,
      stream: true,
      top_p:
        "probability_mass" in options && isNumber(options.probability_mass)
          ? options.probability_mass
          : 1,
    };
  }

  async function chat(options: IChatOptions) {
    if (!options.api_key) {
      throw new Error("请提供有效的 API KEY");
    }

    const isStream = true;
    const params = buildParams(options);

    const response = await fetch(
      (options.api_base_url || baseApiUrl) + "/v1/chat/completions",
      {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + options.api_key,
        },
      }
    );

    const stream = response.body;
    if (!stream) {
      throw new Error("Unknown Error");
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");
    function readStream() {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            options.onProgress("", { done: true });
            return;
          }

          const text = decoder.decode(value, { stream: true });
          if (text.startsWith("{")) {
            const data = JSON.parse(text);
            if (data && data.error) {
              throw new Error(data.error.message);
            }
          }

          const lines = text.trim().split("\n");
          lines.forEach((line) => {
            if (line.length < 1) return;
            const value = isStream ? line.slice(6) : line;
            if (value === "[DONE]") {
              options.onProgress("", { done: true });
              return;
            }

            try {
              const result = JSON.parse(value);
              if (isStream) {
                const [content] = result.choices;
                options.onProgress(content.delta?.content ?? "", {
                  done: false,
                });
              } else {
                const [messageInfo] = result.choices;

                options.onProgress(messageInfo.message.content ?? "", {
                  done: true,
                });
              }
            } catch (err) {
              console.log({ value, err });
              throw err;
            }
          });

          readStream();
        })
        .catch((err) => {
          console.log({ err });
          options.onError && options.onError(err);
        });
    }

    readStream();
  }

  return {
    chat,
  };
};
