// js/battery/batteryCalculator.js
export const calculateBatteryOptions = (battery) => {
  // Приклад логіки: на основі розмірів і кількості акумуляторів
  const rackTypes = [
    { type: "Стандартний", beamCapacity: 4, price: 1000 },
    { type: "Промисловий", beamCapacity: 6, price: 1500 },
  ];

  return rackTypes.map((rack) => {
    const spans = Math.ceil(battery.count / rack.beamCapacity);
    const totalPrice = spans * rack.price;
    return {
      type: rack.type,
      spans,
      totalPrice,
    };
  });
};
