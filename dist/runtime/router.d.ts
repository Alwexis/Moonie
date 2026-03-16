export declare const currentPath: {
    get(): string;
    set(newValue: string): void;
};
export declare const currentParams: {
    get(): Record<string, string>;
    set(newValue: Record<string, string>): void;
};
export declare function navigate(to: string): void;
export interface Route {
    path: string;
    component: () => HTMLElement;
    fallback?: () => HTMLElement;
}
export declare function RouterView({ routes, fallback, }: {
    routes: Route[];
    fallback?: () => HTMLElement;
}): Comment;
export declare function useParams(): Record<string, string>;
/**
 * Wrapper de etiqueta anchor que previene la navegación nativa y la reemplaza por navigate.
 */
export declare function Link({ to, children, ...props }: {
    to: string;
    children: string;
    [key: string]: any;
}): any;
