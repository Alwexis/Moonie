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
      pos = end + 3;
      continue;
    }

    if (template[pos] === "{" && template[pos + 1] === "{") {
      const end = template.indexOf("}}", pos);
      const value = template.slice(pos + 2, end).trim();
      tokens.push({ type: "Interpolation", value });
      pos = end + 2;
      continue;
    }

    if (template[pos] === "{") {
      let depth = 1;
      let start = pos + 1;
      pos++;
      while (pos < template.length && depth > 0) {
        if (template[pos] === "{") depth++;
        if (template[pos] === "}") depth--;
        pos++;
      }
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
        }
        pos = regex.lastIndex;
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch) {
      console.warn(
        `Carácter inesperado en posición ${pos}: "${template[pos]}"`,
      );
      pos++;
    }
  }

  return tokens;
}
