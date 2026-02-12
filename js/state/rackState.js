export const initialRackState = {
    floors: 1,
    verticalSupports: "",
    supports: "",
    rows: 1,
    beamsPerRow: 2,
    beams: new Map(), // Map для прольотів
};

export let rackState = {
    ...initialRackState,
};

export const resetRackState = () => {
    rackState = { ...initialRackState };
};
