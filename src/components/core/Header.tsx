'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
    isKioskMode?: boolean;
    onToggleKiosk?: () => void;
}

/**
 * Header - Minimal top bar with branding, clock, and kiosk toggle
 */
export function Header({ isKioskMode = false, onToggleKiosk }: HeaderProps) {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <header className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            {/* Left: Branding */}
            <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-orange-500 tracking-wider">
                    YAP-IT
                </h1>
                <span className="text-xs text-zinc-600">MONITOR</span>
            </div>

            {/* Right: Clock & Controls */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-white">{formatTime(currentTime)}</span>
                    <span className="text-zinc-500">{formatDate(currentTime)}</span>
                </div>

                {onToggleKiosk && (
                    <button
                        onClick={onToggleKiosk}
                        className={`px-3 py-1 text-xs rounded border transition-colors ${isKioskMode
                                ? 'bg-orange-500 text-black border-orange-500'
                                : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-orange-500'
                            }`}
                        title="Toggle Kiosk Mode (K)"
                    >
                        {isKioskMode ? 'EXIT' : 'KIOSK'}
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;
