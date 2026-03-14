/**
 * Computed en si mismo se comporta igual que el effect para que se inyecte como dependencia.
 * pero nuestro "fn" acá no llama al callback que usamos como parámeetro, sino que cambia la flag a true para que se recalcule
 * ¿Cómo se llama al get() automáticamente si no se referencia a si mismo como el effect?
 * La primera vez que se llama computed, siempre se recalcula. Por ende en ese preciso momento se inyecta como dependencia
 * y entrega un valor. Desde ese momento es un observador de lo que sea que le hayamos pasado.
 */
export declare function computed<T>(fn: () => T): {
    get(): T;
};
