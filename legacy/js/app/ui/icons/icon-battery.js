// js/app/ui/icons/icon-battery.js

/**
 * Battery icon - для навігації "Акумулятор"
 * @param {Object} props
 * @param {number} [props.size=16] - розмір іконки
 * @param {string} [props.className=''] - додаткові CSS класи
 * @returns {string} HTML SVG
 */
export const iconBattery = ({ size = 16, className = '' } = {}) => `
  <svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2" />
    <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" />
    <line x1="6" y1="11" x2="6" y2="17" stroke="currentColor" stroke-width="2" />
    <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="2" />
    <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="2" />
    <line x1="18" y1="11" x2="18" y2="17" stroke="currentColor" stroke-width="2" />
  </svg>
`;

export default iconBattery;
