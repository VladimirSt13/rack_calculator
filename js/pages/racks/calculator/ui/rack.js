"js/pages/racks/ui/rack.js";

import { getRacksRefs } from "./dom.js";

const refs = getRacksRefs();

export const updateRackName = (html) => (refs.rackName.innerHTML = html);

export const updateComponentsTable = (html) => (refs.componentsTable.innerHTML = html);
