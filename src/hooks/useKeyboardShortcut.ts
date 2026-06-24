import { useEffect } from 'react';

export const useKeyboardShortcut = (key: string, callback: () => void, ctrlOrCmd = true) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Проверяем, не находится ли пользователь в поле ввода (чтобы не срабатывать при печати)
      if (
        event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement || 
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const isMeta = ctrlOrCmd ? (event.ctrlKey || event.metaKey) : true;
      if (isMeta && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrlOrCmd]);
};
