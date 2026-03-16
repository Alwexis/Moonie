import { parseMnFile } from "./mn-parser.js";
import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";
import { generateCodeNodes } from "./codegen.js";
function extractImports(script) {
    const importRegex = /^\s*import\s+([\s\S]*?from\s+)?['"][^'"]+['"]\s*;?/gm;
    const imports = [];
    const code = script
        .replace(importRegex, (match) => {
        imports.push(match);
        return "";
    })
        .trim();
    return {
        imports: imports.join("\n"),
        code,
    };
}
export function mooniePlugin() {
    return {
        name: "vite-plugin-moonie",
        transform(code, id) {
            if (!id.endsWith(".mn"))
                return;
            const { script, template } = parseMnFile(code);
            const { imports, code: scriptCode } = extractImports(script);
            const tokens = tokenize(template);
            const ast = parse(tokens);
            const templateCode = generateCodeNodes(ast);
            const output = `
import { h, If, For } from 'moonie';
${imports}
    
export default function Component(rawProps = {}) {
  const props = new Proxy(rawProps, {
    get(target, key) {
      const val = target[key];
      if (typeof val === 'function' && val.__reactive) return val();
      return val;
    }
  });
  const { children, slots } = rawProps;
  ${scriptCode}
  return ${templateCode};
}
    `;
            return { code: output.trim() };
        },
    };
}
