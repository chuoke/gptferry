<template>
  <div class="content" @click="handleClick($event)" v-html="htmlStr"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { copyToClipboard } from "quasar";

const props = withDefaults(
  defineProps<{
    text: string;
    loading?: boolean;
  }>(),
  {
    loading: false,
  }
);

const htmlStr = computed(() => {
  return (
    str2html(props.text) + (props.loading ? "<span class='typing'></span>" : "")
  );
});

const md = new MarkdownIt({
  breaks: true,
  highlight: function (str, lang) {
    let highlightedText = "";

    if (lang && hljs.getLanguage(lang)) {
      highlightedText = hljs.highlight(str, {
        language: lang,
        ignoreIllegals: true,
      }).value;
    } else if (!lang && str) {
      const detection = hljs.highlightAuto(str);
      lang = detection.language || lang;
      highlightedText = detection.value;
    }

    const copyIcon =
      '<i class="q-icon copy-code notranslate material-icons" aria-hidden="true" role="presentation">content_copy</i>';

    if (highlightedText) {
      try {
        return (
          `<pre class="hljs language-${lang}">${copyIcon}` +
          `<code>${highlightedText}</code>` +
          "</pre>"
        );
      } catch (__) {}
    }

    return (
      `<pre class="hljs">${copyIcon}<code>` +
      md.utils.escapeHtml(str) +
      "</code></pre>"
    );
  },
});

function str2html(str: string, model: string = "render") {
  // eslint-disable-next-line security/detect-object-injection
  return model in md ? md[model](str) : str;
}

async function handleClick(event: MouseEvent) {
  if (!event.target) {
    return;
  }

  const target = event.target as HTMLElement;

  if (target.className.includes("copy-code")) {
    if (target.nextSibling?.textContent) {
      const isCoppied = await copyContent(target.nextSibling?.textContent);
      if (isCoppied) {
        const innerText = target.innerText;
        target.innerText = "done";
        setTimeout(() => {
          target.innerText = innerText;
        }, 1000);
      }
    }
  }
}

async function copyContent(str: string): Promise<boolean> {
  try {
    await copyToClipboard(str);
    return true;
  } catch (err) {
    return false;
  }

  // .then(() => {
  //   $q.notify({ message: "内容已复制" });
  // })
  // .catch(() => {
  //   $q.notify({ message: "内容复制失败" });
  // });
}
</script>

<style lang="scss">
.content {
  p {
    margin-bottom: 0.5rem;

    code {
      background-color: #f2f3f545;
      padding: 0 2px;
      border-radius: 2px;
      white-space: pre-wrap;
    }
  }

  pre {
    margin: 5px;
    border-radius: 5px;
    padding: 10px;
    position: relative;

    span {
      white-space: pre-wrap;
    }

    .copy-code {
      position: absolute;
      right: 2px;
      top: 2px;
      font-size: 14px;
      opacity: 0.7;
      cursor: pointer;
    }
  }

  .typing {
    font-size: 2em;
    margin: 0;
    font-family: "Courier New";

    &:after {
      content: "|";
      animation: blink 500ms linear infinite alternate;
    }

    @keyframes blink {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  }
}
</style>
