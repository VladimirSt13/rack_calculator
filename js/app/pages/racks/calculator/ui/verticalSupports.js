// js/app/pages/racks/calculator/ui/verticalSupports.js

/**
 * Toggles the vertical supports UI based on the number of floors.
 *
 * @param {Object} options - The options object.
 * @param {number} options.floors - The number of floors.
 * @param {Object} options.refs - The references to the DOM elements.
 * @return {void}
 */
export const toggleVerticalSupportsUI = ({ floors, refs }) => {
  const disabled = floors < 2;
  refs.verticalSupports.disabled = disabled;
  if (disabled) refs.verticalSupports.selectedIndex = -1;

  if (floors < 2) {
    refs.verticalSupports.selectedIndex = -1;
    refs.verticalSupports.disabled = true;
    refs.verticalSupports.children[0].textContent = "";
  } else {
    refs.verticalSupports.disabled = false;
    refs.verticalSupports.selectedIndex = 0;
    refs.verticalSupports.children[0].textContent = "Виберіть...";
  }
};
