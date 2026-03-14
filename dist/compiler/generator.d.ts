import { type ASTNode } from "./parser";
export declare function generate(node: ASTNode, context?: Record<string, any>): any;
export declare function generateNodes(nodes: ASTNode[], context?: Record<string, any>): any[];
export declare function compile(template: string, context: Record<string, any>): any;
