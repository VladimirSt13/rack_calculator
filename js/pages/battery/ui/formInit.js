import { battRefs } from "./dom.js";

export const renderErrors = (errors = {}) => {
  // Очищаємо попередні підсвічування
  Object.values(battRefs).forEach((ref) => {
    if (ref.tagName === "INPUT") {
      ref.classList.remove("error");
      ref.title = "";
    }
  });

  // Додаємо підсвічування для полів з помилками
  for (const [field, message] of Object.entries(errors)) {
    const refKey = "battery" + field[0].toUpperCase() + field.slice(1);
    const ref = battRefs[refKey];
    if (ref) {
      ref.classList.add("error");
      ref.title = message;
    }
  }
};
