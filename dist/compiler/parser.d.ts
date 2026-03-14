import type { Token } from "./tokenizer";
export interface ASTNode {
    type: "Element" | "Text" | "Directive" | "Interpolation";
    tag?: string;
    props?: Record<string, any>;
    children?: ASTNode[];
    value?: string;
    directive?: string;
    condition?: string;
}
export declare function parse(tokens: Token[]): ASTNode[];
