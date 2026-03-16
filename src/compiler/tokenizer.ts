export type TokenType =
  | "OpenTag"
  | "OpenTagEnd"
  | "CloseTag"
  | "SelfClosingTag"
  | "Attribute"
  | "ReactiveAttribute"
  | "Event"
  | "Text"
  | "Directive"
  | "Condition"
  | "Block"
  | "Whitespace"
  | "Interpolation";

export interface Token {
  type: TokenType;
  value: string | Token[];
}

export function tokenize(template: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;

  function _countLines(str: string) {
    for (const ch of str) if (ch === "\n") line++;
  }

  const patterns: { type: TokenType; regex: RegExp }[] = [
    { type: "CloseTag", regex: /<\/[a-zA-Z][a-zA-Z0-9]*>/y },
    { type: "OpenTag", regex: /<[a-zA-Z][a-zA-Z0-9]*/y },
    { type: "SelfClosingTag", regex: /\/>/y },
    { type: "OpenTagEnd", regex: />/y },
    { type: "ReactiveAttribute", regex: /:[a-zA-Z][a-zA-Z0-9-]*="[^"]*"/y },
    { type: "Directive", regex: /@(if|else|for|empty)/y },
    { type: "Condition", regex: /\(.*\)/y },
    { type: "Event", regex: /@[a-zA-Z][a-zA-Z0-9-]*="[^"]*"/y },
    { type: "Attribute", regex: /(?![:@])[a-zA-Z][a-zA-Z0-9-]*="[^"]*"/y },
    { type: "Whitespace", regex: /\s+/y },
    { type: "Interpolation", regex: /\{\{(.+?)\}\}/y },
    { type: "Text", regex: /[^<@{}\s][^<@{}]*/y },
  ];

  while (pos < template.length) {
    let foundMatch = false;

    // ignoramos comentarios
    if (template.startsWith("<!--", pos)) {
      const end = template.indexOf("-->", pos);
      if (end === -1)
        throw new Error(
          `[Moonie] Comentario sin cerrar en línea ${line}. ¿Se te olvidó "-->"?`,
        );
      _countLines(template.slice(pos, end + 3));
      pos = end + 3;
      continue;
    }

    if (template[pos] === "{" && template[pos + 1] === "{") {
      const end = template.indexOf("}}", pos);
      if (end === -1)
        throw new Error(
          `[Moonie] Interpolación sin cerrar en línea ${line}. ¿Se te olvidó "}}"?`,
        );
      const value = template.slice(pos + 2, end).trim();
      tokens.push({ type: "Interpolation", value });
      _countLines(template.slice(pos, end + 2));
      pos = end + 2;
      continue;
    }

    if (template[pos] === "{") {
      let depth = 1;
      let start = pos + 1;
      const startLine = line;
      pos++;
      while (pos < template.length && depth > 0) {
        if (template[pos] === "\n") line++;
        if (template[pos] === "{") depth++;
        if (template[pos] === "}") depth--;
        pos++;
      }
      if (depth > 0)
        throw new Error(
          `[Moonie] Bloque sin cerrar que comenzó en línea ${startLine}. ¿Se te olvidó "}"?`,
        );
      const innerTokens = tokenize(template.slice(start, pos - 1).trim());
      tokens.push({ type: "Block", value: innerTokens });
      continue;
    }

    for (const { type, regex } of patterns) {
      regex.lastIndex = pos;
      const match = regex.exec(template);
      if (match) {
        if (type !== "Whitespace") {
          tokens.push({ type, value: match[0] });
        } else {
          _countLines(match[0]);
        }
        pos = regex.lastIndex;
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch) {
      // console.warn(
      //   `Carácter inesperado en posición ${pos}: "${template[pos]}"`,
      // );
      pos++;
    }
  }

  return tokens;
}
