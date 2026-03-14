import { parseMnFile } from "./mn-parser.js";
import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";
import { generateCodeNodes } from "./codegen.js";
function extractImports(script) {
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
    
    export default function Component(props = {}) {
      ${scriptCode}
      return ${templateCode};
    }
    `;
            return { code: output };
        },
    };
}
