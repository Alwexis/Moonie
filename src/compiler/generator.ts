import { h } from "../runtime/h";
import { If, For } from "../runtime/directives";
import { parse, type ASTNode } from "./parser";
import { tokenize } from "./tokenizer";

export function generate(
  node: ASTNode,
  context: Record<string, any> = {},
): any {
  if (node.type === "Text") {
    return node.value;
  }

  if (node.type === "Interpolation") {
    return () => evaluate(node.value!, context);
  }

  if (node.type === "Element") {
    const { props, children, tag } = node;
    const isComponent =
      tag![0] === tag![0].toUpperCase() && tag![0] !== tag![0].toLowerCase();
    const tagOrComponent = isComponent ? context[tag!] : tag!;
    const finalProps: Record<string, any> = {};
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value.reactive) {
          finalProps[key] = () => evaluate(value.expression, context);
          finalProps[key].__reactive = true;
        } else if (value.event) {
          finalProps[key] = (e: Event) =>
            execute(value.expression, { ...context, $event: e });
        } else {
          finalProps[key] = value;
        }
      }
    }
    const childs = children ? generateNodes(children, context) : []; // ← bien
    return h(tagOrComponent, finalProps, childs as any);
  }
  console.warn("nodo sin manejar:", node);
  return null;
}

export function generateNodes(
  nodes: ASTNode[],
  context: Record<string, any> = {},
): any[] {
  const result = [];
  let i = 0;
  while (i < nodes.length) {
    const node = nodes[i];

    if (node.type === "Directive" && node.directive === "if") {
      // mirar si el siguiente es @else
      const next = nodes[i + 1];
      const hasElse = next?.type === "Directive" && next?.directive === "else";

      result.push(
        h(If, {
          when: () => evaluate(node.condition!, context),
          then: () => generateNodes(node.children!, context)[0],
          otherwise: hasElse
            ? () => generateNodes(next.children!, context)[0]
            : undefined,
        }),
      );

      if (hasElse) i++; // saltamos el @else
    } else if (node.type === "Directive" && node.directive === "for") {
      const { variable, array, key } = parseForCondition(node.condition!) ?? {};
      const next = nodes[i + 1];
      const hasEmpty =
        next?.type === "Directive" && next?.directive === "empty";

      result.push(
        h(For, {
          each: () => evaluate(array, context), // ← cambia esta línea
          key: (item: any) => evaluate(key, { ...context, [variable]: item }),
          render: (item: any) =>
            generateNodes(node.children!, { ...context, [variable!]: item })[0],
          empty: hasEmpty
            ? () => generateNodes(next.children!, context)[0]
            : undefined,
        }),
      );

      if (hasEmpty) i++;
    } else {
      result.push(generate(node, context));
    }

    i++;
  }
  return result;
}

function parseForCondition(cond: string): any {
  const matches = /(\w+)\s+of\s+([^;]+);\s*key:\s*(.+)/.exec(cond);
  if (matches?.length === 4) {
    return {
      variable: matches[1].trim(),
      array: matches[2].trim(),
      key: matches[3].trim(),
    };
  }
  return null;
}

// para leer valores
function evaluate(expression: string, context: Record<string, any>) {
  return new Function(...Object.keys(context), `return ${expression}`)(
    ...Object.values(context),
  );
}

// para ejecutar side effects (asignaciones, mutaciones)
function execute(expression: string, context: Record<string, any>) {
  new Function(...Object.keys(context), expression)(...Object.values(context));
}

export function compile(template: string, context: Record<string, any>): any {
  const tokens = tokenize(template);
  const ast = parse(tokens);
  const result = generateNodes(ast, context);
  return result;
}
