export const initialRackState = {
  floors: 1,
  rows: 1,
  beamsPerRow: 2,
  verticalSupport: "",
  support: "215",
  beams: new Map(), // Map для прольотів
};

export let rackState = {
  ...initialRackState,
};

export const resetRackState = () => {
  rackState = { ...initialRackState };
};
