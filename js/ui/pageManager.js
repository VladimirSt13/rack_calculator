// js/ui/pageManager.js

const modules = new Map(); // key = view id
let currentView = null;

export const registerPageModule = ({ id, init, activate, deactivate }) => {
  modules.set(id, { init, activate, deactivate, initialized: false });
  console.log(modules);
};

export const activatePage = async (id) => {
  if (currentView) {
    const prevPage = modules.get(currentView);
    prevPage?.deactivate?.(currentView);
  }

  const page = modules.get(id);
  if (!page) return console.warn(`Модуль сторінки ${id} не знайдено`);

  if (!page.initialized) {
    await page.init();
    page.initialized = true;
  }

  page.activate?.(id);
  currentView = id;
};
