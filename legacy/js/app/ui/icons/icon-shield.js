// js/app/ui/icons/icon-shield.js

/**
 * Shield icon - для захисту/резерву (нульова ціна)
 * @param {Object} props
 * @param {number} [props.size=20] - розмір іконки
 * @param {string} [props.className=''] - додаткові CSS класи
 * @returns {string} HTML SVG
 */
export const iconShield = ({ size = 20, className = '' } = {}) => `
  <svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;

export default iconShield;
