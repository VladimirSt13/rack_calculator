let priceData = null;

// Завантаження прайсу
export const loadPrice = async () => {
  if (priceData) return priceData;
  const res = await fetch("price.json");
  priceData = await res.json();
  return priceData;
};

// Повернути прайс синхронно після завантаження
export const getPrice = () => {
  if (!priceData) throw new Error("Price not loaded yet");
  return priceData;
};
