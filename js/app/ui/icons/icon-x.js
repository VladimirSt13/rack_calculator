// js/app/ui/icons/icon-x.js

/**
 * X icon - для закриття/видалення (хрестик)
 * @param {Object} props
 * @param {number} [props.size=14] - розмір іконки
 * @param {string} [props.className=''] - додаткові CSS класи
 * @returns {string} HTML SVG
 */
export const iconX = ({ size = 14, className = '' } = {}) => `
  <svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
`;

export default iconX;
