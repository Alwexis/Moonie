type MaybeArray = HTMLElement | HTMLElement[];
export declare function If({ when, then, otherwise, }: {
    when: () => boolean;
    then: () => MaybeArray;
    otherwise?: () => MaybeArray;
}): Comment;
export declare function For<T>({ each, render, key, empty, }: {
    each: T[] | (() => T[]);
    render: (item: T) => MaybeArray;
    key: (item: T, index: number) => string | number;
    empty?: () => MaybeArray;
}): Comment;
export {};
