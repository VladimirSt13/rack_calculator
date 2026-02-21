/**
 * Повертає слово "балка" у правильній формі залежно від кількості
 * @param {number} count - кількість балок
 * @returns {string}
 */
export const beamWord = (count) => {
  count = Math.abs(count) % 100;
  const lastDigit = count % 10;

  if (count > 10 && count < 20) return "балок";
  if (lastDigit === 1) return "балка";
  if (lastDigit >= 2 && lastDigit <= 4) return "балки";
  return "балок";
};
