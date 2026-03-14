export type TokenType = "OpenTag" | "OpenTagEnd" | "CloseTag" | "SelfClosingTag" | "Attribute" | "ReactiveAttribute" | "Event" | "Text" | "Directive" | "Condition" | "Block" | "Whitespace" | "Interpolation";
export interface Token {
    type: TokenType;
    value: string | Token[];
}
export declare function tokenize(template: string): Token[];
