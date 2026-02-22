// js/pages/racks/ui/templates/rackName.js

export const generateRackNameHTML = ({ description, abbreviation }) =>
  !description || !abbreviation ? '---' : `<span>${description} ${abbreviation}</і>`;
