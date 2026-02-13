import { rackState } from "../state/rackState.js";

export const updateFloors = (value) => {
  const floors = Number(value) || null;
  rackState.floors = floors;

  if (floors < 2) {
    rackState.verticalSupports = "";
  }
};

export const updateRows = (value) => {
  rackState.rows = Number(value) || null;
};

export const updateBeamsPerRow = (value) => {
  rackState.beamsPerRow = Number(value) || null;
};

export const updateVerticalSupports = (value) => {
  rackState.verticalSupports = value || "";
};

export const updateSupports = (value) => {
  rackState.supports = value || "";
};
