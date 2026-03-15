export function generateCode(node) {
    if (node.type === "Text") {
        const escaped = node.value.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
        return `\`${escaped}\``;
    }
    if (node.type === "Interpolation") {
        return `() => ${node.value}`;
    }
    if (node.type === "Element") {
        const tag = node.tag;
        const isComponent = tag[0] === tag[0].toUpperCase() && tag[0] !== tag[0].toLowerCase();
        const propsCode = generateProps(node.props ?? {}, isComponent);
        const childrenCode = node.children && node.children.length > 0
            ? `[${generateCodeNodes(node.children)}]`
            : "[]";
        const tagCode = isComponent ? tag : `'${tag}'`;
        return `h(${tagCode}, ${propsCode}, ${childrenCode})`;
    }
    if (node.type === "Directive") {
        if (node.directive === "if") {
            const thenCode = generateCodeNodes(node.children ?? []);
            return `h(If, { when: () => ${node.condition}, then: () => ${thenCode} })`;
        }
        if (node.directive === "for") {
            const match = /(\w+)\s+of\s+([^;]+);\s*key:\s*(.+)/.exec(node.condition ?? "");
            if (match) {
                const [, variable, array, key] = match;
                const renderCode = generateCodeNodes(node.children ?? []);
                return `h(For, { each: () => ${array.trim()}, key: (${variable}) => ${key.trim()}, render: (${variable}) => ${renderCode} })`;
            }
        }
        if (node.directive === "empty") {
            return "";
        }
    }
    return "";
}
function generateProps(props, isComponent = false) {
    const entries = Object.entries(props);
    if (entries.length === 0)
        return "{}";
    const propsStr = entries
        .map(([key, value]) => {
        const safeKey = /[^a-zA-Z0-9_$]/.test(key) ? `"${key}"` : key;
        if (value.reactive) {
            return isComponent
                ? `${safeKey}: ${value.expression}`
                : `${safeKey}: () => ${value.expression}`;
        }
        else if (value.event) {
            return `${safeKey}: ($event) => { ${value.expression} }`;
        }
        else {
            return `${safeKey}: \`${value}\``;
        }
    })
        .join(", ");
    return `{ ${propsStr} }`;
}
export function generateCodeNodes(nodes) {
    const result = [];
    let i = 0;
    while (i < nodes.length) {
        const node = nodes[i];
        if (node.type === "Directive" && node.directive === "for") {
            const next = nodes[i + 1];
            const hasEmpty = next?.type === "Directive" && next?.directive === "empty";
            const match = /(\w+)\s+of\s+([^;]+);\s*key:\s*(.+)/.exec(node.condition ?? "");
            if (match) {
                const [, variable, array, key] = match;
                const children = node.children ?? [];
                const renderCode = children.length === 1
                    ? generateCodeNodes(children)
                    : `[${generateCodeNodes(children)}]`;
                const emptyCode = hasEmpty
                    ? `, empty: () => ${generateCodeNodes(next.children ?? [])}`
                    : "";
                result.push(`h(For, { each: () => ${array.trim()}, key: (${variable}) => ${key.trim()}, render: (${variable}) => ${renderCode}${emptyCode} })`);
                if (hasEmpty)
                    i++;
            }
        }
        else if (node.type === "Directive" && node.directive === "if") {
            const next = nodes[i + 1];
            const hasElse = next?.type === "Directive" && next?.directive === "else";
            const thenChildren = node.children ?? [];
            const thenCode = thenChildren.length === 1
                ? generateCodeNodes(thenChildren)
                : `[${generateCodeNodes(thenChildren)}]`;
            let elseCode = "";
            if (hasElse) {
                const elseChildren = next.children ?? [];
                const elseNodes = elseChildren.length === 1
                    ? generateCodeNodes(elseChildren)
                    : `[${generateCodeNodes(elseChildren)}]`;
                elseCode = `, otherwise: () => ${elseNodes}`;
            }
            result.push(`h(If, { when: () => ${node.condition}, then: () => ${thenCode}${elseCode} })`);
            if (hasElse)
                i++;
        }
        else {
            result.push(generateCode(node));
        }
        i++;
    }
    return result.join(", ");
}
