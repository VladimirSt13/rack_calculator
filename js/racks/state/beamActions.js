import { rackState } from "./rackState.js";

let id = 0;

export const addBeamAction = () => {
  id++;
  rackState.beams.set(id, { item: "", quantity: null });
  return id;
};

export const removeBeamAction = (id) => {
  rackState.beams.delete(id);
};

export const updateBeamAction = (id, patch) => {
  const prev = rackState.beams.get(id);
  if (!prev) return;

  rackState.beams.set(id, {
    ...prev,
    ...patch,
  });
};
