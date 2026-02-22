/**
 * Compose a list of functions into a single function.
 * The composed function will return the result of applying the last function
 * to the first function in the list, with the result of the previous function
 * being passed as an argument to the next function.
 * @example
 * const add = (x) => x + 1;
 * const multiply = (x) => x * 2;
 * const composed = compose(add, multiply);
 * console.log(composed(3)); // 8
 */
export const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((v, fn) => fn(v), x);

export const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, fn) => fn(v), x);
