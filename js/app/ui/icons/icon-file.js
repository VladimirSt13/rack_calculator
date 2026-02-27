// js/app/ui/icons/icon-file.js

/**
 * File icon - для документів/файлів (комплект стелажів)
 * @param {Object} props
 * @param {number} [props.size=20] - розмір іконки
 * @param {string} [props.className=''] - додаткові CSS класи
 * @returns {string} HTML SVG
 */
export const iconFile = ({ size = 20, className = '' } = {}) => `
  <svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 7h-9M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="2" />
    <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" stroke-width="2" />
  </svg>
`;

export default iconFile;
