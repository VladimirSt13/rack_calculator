import { battRefs } from "./ui/dom.js";

export const validateBatteryForm = () => {
  const values = {
    width: Number(battRefs.batteryWidth.value),
    length: Number(battRefs.batteryLength.value),
    height: Number(battRefs.batteryHeight.value),
    weight: Number(battRefs.batteryWeight.value),
    gap: Number(battRefs.batteryGap.value) || 0,
    count: Number(battRefs.batteryCount.value),
  };

  const errors = {};

  if (!values.width || values.width <= 0) errors.width = "Ширина повинна бути більше 0";
  if (!values.length || values.length <= 0) errors.length = "Довжина повинна бути більше 0";
  if (!values.height || values.height <= 0) errors.height = "Висота повинна бути більше 0";
  if (!values.weight || values.weight <= 0) errors.weight = "Вага повинна бути більше 0";
  if (values.gap < 0) errors.gap = "Відстань не може бути від’ємною";
  if (!values.count || values.count < 1) errors.count = "Кількість повинна бути щонайменше 1";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values,
  };
};
