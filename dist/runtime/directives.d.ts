export declare function If({ when, then, otherwise, }: {
    when: () => boolean;
    then: () => HTMLElement;
    otherwise?: () => HTMLElement;
}): Comment;
export declare function For<T>({ each, render, key, empty, }: {
    each: T[] | (() => T[]);
    render: (item: T) => HTMLElement;
    key: (item: T, index: number) => string | number;
    empty?: () => HTMLElement;
}): Comment;
