/**
 * widgetStore - Zustand store for widget layout state
 * Manages panel positions, sizes, and visibility
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WidgetLayout {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    visible: boolean;
}

export interface WidgetState {
    layouts: WidgetLayout[];
    isKioskMode: boolean;

    // Actions
    setLayouts: (layouts: WidgetLayout[]) => void;
    toggleWidget: (id: string) => void;
    toggleKioskMode: () => void;
    resetLayouts: () => void;
}

const defaultLayouts: WidgetLayout[] = [
    { id: 'polymarket', x: 0, y: 0, w: 4, h: 6, visible: true },
    { id: 'flights', x: 4, y: 0, w: 5, h: 6, visible: true },
    { id: 'transit', x: 9, y: 0, w: 3, h: 3, visible: true },
    { id: 'social', x: 9, y: 3, w: 3, h: 3, visible: true },
];

export const useWidgetStore = create<WidgetState>()(
    persist(
        (set) => ({
            layouts: defaultLayouts,
            isKioskMode: false,

            setLayouts: (layouts) => set({ layouts }),

            toggleWidget: (id) =>
                set((state) => ({
                    layouts: state.layouts.map((layout) =>
                        layout.id === id ? { ...layout, visible: !layout.visible } : layout
                    ),
                })),

            toggleKioskMode: () =>
                set((state) => ({ isKioskMode: !state.isKioskMode })),

            resetLayouts: () => set({ layouts: defaultLayouts }),
        }),
        {
            name: 'yap-it-widget-layout',
        }
    )
);

export default useWidgetStore;
