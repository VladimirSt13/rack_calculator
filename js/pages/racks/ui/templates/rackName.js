export const generateRackNameHTML = ({ description, abbreviation }) => {
  return !description || !abbreviation ? "---" : `<span>${description} ${abbreviation}</і>`;
};
