// js/app/ui/icons/icon-chevron-down.js

/**
 * Chevron Down icon - стрілка вниз
 * @param {Object} props
 * @param {number} [props.size=10] - розмір іконки
 * @param {string} [props.className=''] - додаткові CSS класи
 * @returns {string} HTML SVG
 */
export const iconChevronDown = ({ size = 10, className = '' } = {}) => `
  <svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;

export default iconChevronDown;
