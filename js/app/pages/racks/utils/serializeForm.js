export const serializeForm = (form) => {
  if (!form) {
    return '';
  }
  return JSON.stringify({
    ...form,
    // Перетворюємо Map на масив, якщо потрібно
    beams: form.beams instanceof Map ? Array.from(form.beams.values()) : form.beams,
  });
};
