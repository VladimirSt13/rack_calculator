// js/app/ui/icons/icon-minus.js

/**
 * Minus icon - для віднімання
 * @param {Object} props
 * @param {number} [props.size=16] - розмір іконки
 * @param {string} [props.className=''] - додаткові CSS класи
 * @returns {string} HTML SVG
 */
export const iconMinus = ({ size = 16, className = '' } = {}) => `
  <svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
`;

export default iconMinus;
