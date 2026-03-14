export declare function mooniePlugin(): {
    name: string;
    transform(code: string, id: string): {
        code: string;
    } | undefined;
};
