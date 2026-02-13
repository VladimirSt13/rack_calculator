import { refs } from "./dom.js";

export const updateRackName = (html) => (refs.rackName.innerHTML = html);

export const updateComponentsTable = (html) => (refs.componentsTable.innerHTML = html);
