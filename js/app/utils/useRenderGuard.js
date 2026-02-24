// @ts-check
// js/app/utils/useRenderGuard.js

/**
 * Creates a render guard to prevent duplicate renders
 * @param {( ...args: any[]) => void} renderFn
 * @param {{ useRAF?: boolean, delay?: number }} [options]
 * @returns {(...args: any[]) => void}
 */
export const useRenderGuard = (renderFn, options = {}) => {
  const { useRAF = true, delay = 0 } = options;
  let isPending = false;
  let timeout = null;

  return (...args) => {
    if (isPending) {
      return;
    }
    isPending = true;

    const execute = () => {
      try {
        renderFn(...args);
      } finally {
        isPending = false;
        timeout = null;
      }
    };

    if (delay > 0) {
      timeout = setTimeout(execute, delay);
    } else if (useRAF) {
      requestAnimationFrame(execute);
    } else {
      execute();
    }
  };
};

export default useRenderGuard;
