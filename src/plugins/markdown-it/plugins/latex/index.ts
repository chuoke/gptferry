import asciimath2latex from 'asciimath-to-latex'
import katex from 'katex'
import type MarkdownIt from 'markdown-it'
import type { RenderRule } from 'markdown-it/lib/renderer'
// import './index.css'
import './index.scss'

const render = (code: string) => {
  let tex = ''
  // eslint-disable-next-line security/detect-unsafe-regex
  code.split(/(?:\n\s*){2,}/).forEach((line: string) => { // consecutive new lines means a new formula
    try {
      tex += katex.renderToString(line.trim(), { displayMode: true })
    } catch (err) {
      throw err;
    }
  })

  return tex;
}

const wrapRender = (code: string) => {
  const rendered = render(code);

  return `<pre>${rendered}</pre>`
}

const LatexPlugin = (md: MarkdownIt) => {
  // inline math
  const originCodeInline = md.renderer.rules.code_inline?.bind(md.renderer.rules)
  md.renderer.rules.code_inline = ((tokens, idx, options, ...resParams) => {
    // eslint-disable-next-line security/detect-object-injection
    const originCode = tokens[idx].content;
    let code = originCode;

    if (code.startsWith('@') && code.endsWith('@')) {
      code = '$' + asciimath2latex(code.substring(1, code.length - 2)) + '$';
    }

    if (code.startsWith('$') && code.endsWith('$')) { // inline math
      code = code.substring(1, code.length - 2);
      try {
        return katex.renderToString(code);
      } catch (err) {
        // return `<pre><code>${err}\n${originCode}</code></pre>`
      }
    }
    return originCodeInline && originCodeInline(tokens, idx, options, ...resParams)
  }) as RenderRule;

  // fenced math block
  const originFence = md.renderer.rules.fence?.bind(md.renderer.rules)
  md.renderer.rules.fence = ((tokens, idx, options, ...resParams) => {
    // eslint-disable-next-line security/detect-object-injection
    const token = tokens[idx];
    let code = token.content.trim();

    try {
      if (token.info === 'math' || token.info === 'katex') { // math
        return wrapRender(code);
      }

      if (/^ascii-?math/i.test(token.info)) {
        // eslint-disable-next-line security/detect-unsafe-regex
        code = code.split(/(?:\n\s*){2,}/).map((item) => { return asciimath2latex(item) }).join('\n\n')
        return wrapRender(code);
      }

      if (code.startsWith('$$') && code.endsWith('$$')) {
        return wrapRender(code.substring(2, code.length - 2));
      }

      if (code.startsWith('$') && code.endsWith('$')) {
        return wrapRender(code.substring(1, code.length - 1));
      }
    } catch (err) {
      console.log({ latex_render_err: err });
    }

    return originFence && originFence(tokens, idx, options, ...resParams)
  }) as RenderRule;
}

export default LatexPlugin