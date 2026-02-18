// js/pages/racks/ui/templates/rackName.js

export const generateRackNameHTML = ({ description, abbreviation }) => {
  return !description || !abbreviation ? "---" : `<span>${description} ${abbreviation}</і>`;
};
