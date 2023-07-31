import MarkdownIt from "markdown-it";
import type { RenderRule } from "markdown-it/lib/renderer";
import type Token from "markdown-it/lib/token";
import Mermaid from "mermaid";
import { nanoid } from "nanoid";

// Define interface to await readiness of import
export default function mermaid(md: MarkdownIt, options: any) {
  // Setup Mermaid
  Mermaid.initialize({
    securityLevel: "loose",
    ...options,
  });

  function getLangName(info: string): string {
    return info.split(/\s+/g)[0];
  }

  function isMermaid(token: Token): boolean {
    if (token.info === 'mermaid') {
      return true;
    }

    if (["mermaid", "{mermaid}"].indexOf(getLangName(token.info) || "") > -1) {
      return true;
    }

    const code = token.content.trim()
    const firstLine = code.split(/\n/)[0].trim();
    if (!firstLine) {
      return false;
    }

    return (firstLine === 'gantt' ||
      firstLine === 'sequenceDiagram' ||
      firstLine === 'classDiagram' ||
      firstLine === 'gitGraph' ||
      firstLine.match(/^graph (?:TB|BT|RL|LR|TD);?$/)) ? true : false;
  }

  const originFence = md.renderer.rules.fence;

  md.renderer.rules.fence = ((tokens: any[], idx: number, options: any, ...resParams) => {
    // eslint-disable-next-line security/detect-object-injection
    const token = tokens[idx];

    if (!isMermaid(token)) {
      return originFence && originFence(tokens, idx, options, ...resParams);
    }

    const id = 'm-' + nanoid();
    let defaultContent = `<pre class="hljs" id="${id}">${token.content}</pre>`;

    const element = document.createElement("div");
    element.style.height = '0px';
    element.id = 'mermaid-' + id;
    document.body.appendChild(element);

    try {
      const container_id = id + '-container';
      Mermaid.mermaidAPI.render(
        container_id,
        token.content,
        element
      ).then(({ svg }) => {
        const imgUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        const imgEle = document.createElement("img");
        imgEle.src = imgUrl;

        const image = new Image();
        image.onload = () => {
          let width = window.innerWidth - 100;
          let height = window.innerHeight - 100;
          if (image.width > image.height) {
            height = width / image.width * image.height;
          } else {
            width = height / image.height * image.width;
          }

          if (height < 500) {
            imgEle.style.height = 300 + 'px';
          }

          const aEle = document.createElement("a");
          aEle.href = imgUrl;
          aEle.target = '_blank';
          aEle.className = 'img-url';
          aEle.dataset.pswpWidth = width + '';
          aEle.dataset.pswpHeight = height + '';
          aEle.append(imgEle);

          defaultContent = aEle.outerHTML;

          if (document.getElementById(id)) {
            document.getElementById(id)!.replaceWith(aEle);
          }
        };
        image.src = imgUrl;
      }).catch((err) => {
        console.log({ id, content: token.content, err });
      }).finally(() => {
        element.remove();
      });
    } catch (err) {
      return `<pre class="alert alert-danger">${err}</pre>`;
    } finally {
      return defaultContent;
    }
  }) as RenderRule;
}