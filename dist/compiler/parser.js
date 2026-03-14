export function parse(tokens) {
    let pos = 0;
    function peek() {
        return tokens[pos] ?? null;
    }
    function consume() {
        return tokens[pos++];
    }
    function parseElement() {
        const openTag = consume();
        const tag = openTag.value.slice(1);
        const props = {};
        while (peek() &&
            peek().type !== "OpenTagEnd" &&
            peek().type !== "SelfClosingTag") {
            const attr = consume();
            if (attr.type === "Attribute") {
                const eqIndex = attr.value.indexOf("=");
                const name = attr.value.slice(0, eqIndex);
                const value = attr.value.slice(eqIndex + 1);
                props[name] = value.slice(1, -1);
            }
            else if (attr.type === "ReactiveAttribute") {
                const eqIndex = attr.value.indexOf("=");
                const name = attr.value.slice(0, eqIndex);
                const value = attr.value.slice(eqIndex + 1);
                props[name.slice(1)] = {
                    reactive: true,
                    expression: value.slice(1, -1),
                };
            }
            else if (attr.type === "Event") {
                const eqIndex = attr.value.indexOf("=");
                const name = attr.value.slice(0, eqIndex);
                const value = attr.value.slice(eqIndex + 1);
                const eventName = name.slice(1);
                props[`on${eventName[0].toUpperCase()}${eventName.slice(1)}`] = {
                    event: true,
                    expression: value.slice(1, -1),
                };
            }
        }
        if (peek()?.type === "SelfClosingTag") {
            consume();
            return { type: "Element", tag, props, children: [] };
        }
        consume(); // OpenTagEnd
        const children = parseChildren();
        consume(); // CloseTag
        return { type: "Element", tag, props, children };
    }
    function parseChildren() {
        const nodes = [];
        while (peek() && peek().type !== "CloseTag") {
            const token = peek();
            if (token.type === "OpenTag") {
                nodes.push(parseElement());
            }
            else if (token.type === "Text") {
                consume();
                nodes.push({ type: "Text", value: token.value });
            }
            else if (token.type === "Directive") {
                consume();
                const directiveName = token.value.slice(1);
                let condition;
                if (peek()?.type === "Condition") {
                    const condToken = consume();
                    condition = condToken.value.slice(1, -1);
                }
                let children = [];
                if (peek()?.type === "Block") {
                    const blockToken = consume();
                    // ← cambio clave: parseChildren en vez de parse
                    const innerTokens = blockToken.value;
                    const savedPos = pos;
                    pos = 0;
                    const innerParser = parse(innerTokens);
                    pos = savedPos;
                    children = innerParser;
                }
                nodes.push({
                    type: "Directive",
                    directive: directiveName,
                    condition,
                    children,
                });
            }
            else if (token.type === "Interpolation") {
                consume();
                nodes.push({
                    type: "Interpolation",
                    value: token.value,
                });
            }
            else {
                consume();
            }
        }
        return nodes;
    }
    // ← cambio clave: usar parseChildren en vez del loop manual
    return parseChildren();
}
