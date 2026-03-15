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
        if (tag === "slot") {
            const slotName = node.props?.name;
            if (slotName) {
                return `slots?.['${slotName}']?.()`;
            }
            return "children";
        }
        const isComponent = tag[0] === tag[0].toUpperCase() && tag[0] !== tag[0].toLowerCase();
        if (isComponent) {
            // separacion de children con slot= de los normales
            const normalChildren = node.children?.filter((c) => !c.props?.slot) ?? [];
            const slottedChildren = node.children?.filter((c) => c.props?.slot) ?? [];
            // generamos el objeto slots si hay slotted children
            let propsCode = generateProps(node.props ?? {}, true);
            if (slottedChildren.length > 0) {
                const slotsCode = slottedChildren
                    .map((c) => {
                    const slotName = c.props.slot;
                    const { slot, ...restProps } = c.props;
                    const nodeCode = generateCode({ ...c, props: restProps });
                    return `'${slotName}': () => ${nodeCode}`;
                })
                    .join(", ");
                // inyectamos slots dentro de los props
                propsCode =
                    propsCode === "{}"
                        ? `{ slots: { ${slotsCode} } }`
                        : propsCode.replace(/^{/, `{ slots: { ${slotsCode} }, `);
            }
            const childrenCode = normalChildren.length > 0
                ? `[${generateCodeNodes(normalChildren)}]`
                : "[]";
            return `h(${tag}, ${propsCode}, ${childrenCode})`;
        }
        const propsCode = generateProps(node.props ?? {}, false);
        const childrenCode = node.children && node.children.length > 0
            ? `[${generateCodeNodes(node.children)}]`
            : "[]";
        return `h('${tag}', ${propsCode}, ${childrenCode})`;
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
        if (key === "ref") {
            return `ref: ${value.expression}`;
        }
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
