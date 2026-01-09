'use client';

import { ReactNode } from 'react';

interface WidgetGridProps {
  children: ReactNode;
}

/**
 * WidgetGrid - Main grid container for dashboard widgets
 * Uses react-grid-layout for resizable/draggable panels
 */
export function WidgetGrid({ children }: WidgetGridProps) {
  return (
    <div className="grid grid-cols-12 gap-2 p-2 h-full w-full bg-black">
      {children}
    </div>
  );
}

export default WidgetGrid;
