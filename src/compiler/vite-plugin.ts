import { parseMnFile } from "./mn-parser";
import { tokenize } from "./tokenizer";
import { parse } from "./parser";
import { generateCodeNodes } from "./codegen";

function extractImports(script: string): { imports: string; code: string } {
  const lines = script.split("\n");
  const importLines = lines.filter((l) => l.trim().startsWith("import"));
  const codeLines = lines.filter((l) => !l.trim().startsWith("import"));
  return {
    imports: importLines.join("\n"),
    code: codeLines.join("\n"),
  };
}

export function mooniePlugin() {
  return {
    name: "vite-plugin-moonie",
    transform(code: string, id: string) {
      if (!id.endsWith(".mn")) return;

      const { script, template } = parseMnFile(code);
      const { imports, code: scriptCode } = extractImports(script);

      const tokens = tokenize(template);
      const ast = parse(tokens);
      const templateCode = generateCodeNodes(ast);

      const output = `
    import { h } from '@moonie/runtime/h.ts';
    import { If, For } from '@moonie/runtime/directives.ts';
    ${imports}
    
    export default function Component(props = {}) {
      ${scriptCode}
      return ${templateCode};
    }
    `;
      return { code: output };
    },
  };
}
