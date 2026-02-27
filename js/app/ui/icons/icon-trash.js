// js/app/ui/icons/icon-trash.js

/**
 * Trash icon - для видалення
 * @param {Object} props
 * @param {number} [props.size=14] - розмір іконки
 * @param {string} [props.className=''] - додаткові CSS класи
 * @returns {string} HTML SVG
 */
export const iconTrash = ({ size = 14, className = '' } = {}) => `
  <svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
`;

export default iconTrash;
