import React from 'react';
import { Toaster as Sonner } from 'sonner';

/**
 * Toaster - глобальний контейнер toast-сповіщень
 * Використовує sonner для відображення сповіщень
 */
export const Toaster: React.FC = () => {
  return (
    <Sonner
      className="sonner"
      position="top-right"
      duration={3000}
      visibleToasts={3}
      closeButton
      richColors
      theme="system"
    />
  );
};

export default Toaster;
