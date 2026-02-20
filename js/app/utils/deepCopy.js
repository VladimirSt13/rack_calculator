/**
 * Creates a deep copy of an object.
 *
 * @param {Object} obj - the object to be copied
 * @returns {Object} a deep copy of the object
 *
 * If the object is not an object or is null, the function returns the original object.
 * Otherwise, it creates a new object and recursively copies each property of the original object.
 */
export const deepCopy = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  let copy = Array.isArray(obj) ? [] : {};

  Object.keys(obj).forEach((key) => {
    copy[key] = deepCopy(obj[key]);
  });

  return copy;
};
