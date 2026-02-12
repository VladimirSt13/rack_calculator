import { rackState } from "../state/rackState.js";

let id = 0;

export const beamController = () => {
  const addBeam = () => {
    id++;
    rackState.beams.set(id, { item: "", quantity: null });
    return id;
  };

  const removeBeam = (id) => {
    rackState.beams.delete(id);
  };

  return { addBeam, removeBeam };
};
