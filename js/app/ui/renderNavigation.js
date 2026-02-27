// js/app/ui/renderNavigation.js

import { iconBattery, iconGrid } from './icons/index.js';

/**
 * @typedef {Object} NavItem
 * @property {string} id - 'rack' | 'battery'
 * @property {string} label - текст посилання
 * @property {string} [activeClass='nav__link--active']
 */

/**
 * Рендерить навігаційне посилання з іконкою
 * @param {NavItem} item
 * @param {boolean} isActive
 * @returns {string}
 */
const renderNavLink = (item, isActive) => {
  const activeClass = isActive ? item.activeClass || 'nav__link--active' : '';
  const icon = item.id === 'rack' ? iconGrid({ size: 16, className: 'nav__icon' }) : iconBattery({ size: 16, className: 'nav__icon' });

  return `
    <li>
      <a href="#view-${item.id}" class="nav__link ${activeClass}" data-view="${item.id}">
        ${icon}
        ${item.label}
      </a>
    </li>
  `;
};

/**
 * Рендерить всю навігацію
 * @param {NavItem[]} navItems
 * @param {string} activeId - активний маршрут
 * @returns {string}
 */
export const renderNavigation = (navItems, activeId) => `
    <ul class="nav">
      ${navItems.map((item) => renderNavLink(item, item.id === activeId)).join('')}
    </ul>
  `;

export default renderNavigation;
