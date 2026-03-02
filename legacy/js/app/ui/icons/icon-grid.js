// js/app/ui/icons/icon-grid.js

/**
 * Grid icon (4 squares) - для навігації "Стелаж"
 * @param {Object} props
 * @param {number} [props.size=16] - розмір іконки
 * @param {string} [props.className=''] - додаткові CSS класи
 * @returns {string} HTML SVG
 */
export const iconGrid = ({ size = 16, className = '' } = {}) => `
  <svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
  </svg>
`;

export default iconGrid;
