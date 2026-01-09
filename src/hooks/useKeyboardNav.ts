/**
 * useKeyboardNav - Hook for keyboard navigation and shortcuts
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    action: () => void;
    description: string;
}

export function useKeyboardNav(shortcuts: KeyboardShortcut[]) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
                const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

                if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        shortcuts,
    };
}

export default useKeyboardNav;
