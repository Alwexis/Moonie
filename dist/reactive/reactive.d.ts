export declare function reactive<T extends object>(obj: T): T & {
    set: (newValue: Partial<T>) => void;
};
