// js/app/core/curry.js

/**
 * Каррує функцію: f(a,b,c) → f(a)(b)(c)
 * @template T
 * @param {Function} fn
 * @param {number} [arity]
 * @returns {Function}
 */
export const curry = (fn, arity = fn.length) =>
  function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    return function (...more) {
      return curried.apply(this, [...args, ...more]);
    };
  };

/**
 * Часткове застосування: f(a,b,c) → f(a,b)(c)
 * @template T
 * @param {Function} fn
 * @param {...any} partialArgs
 * @returns {Function}
 */
export const partial =
  (fn, ...partialArgs) =>
  (...args) =>
    fn.apply(this, [...partialArgs, ...args]);

export default { curry, partial };
