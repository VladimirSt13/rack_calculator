const listeners = new Set();

export const addListener = (target, event, handler, options) => {
  target.addEventListener(event, handler, options);
  listeners.add({ target, event, handler, options });
};

export const removeAllListeners = () => {
  listeners.forEach(({ target, event, handler, options }) => {
    target.removeEventListener(event, handler, options);
  });
  listeners.clear();
};
