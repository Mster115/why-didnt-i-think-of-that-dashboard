'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Command {
    id: string;
    label: string;
    shortcut?: string;
    category?: string;
    action: () => void;
}

interface CommandPaletteProps {
    commands?: Command[];
}

/**
 * CommandPalette - Full keyboard-first navigation (Cmd+K)
 * Features: arrow key navigation, categories, instant execution
 */
export function CommandPalette({ commands = [] }: CommandPaletteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const filteredCommands = commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category?.toLowerCase().includes(search.toLowerCase())
    );

    // Reset selection when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current && isOpen) {
            const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
            selectedEl?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex, isOpen]);

    const executeCommand = useCallback((cmd: Command) => {
        cmd.action();
        setIsOpen(false);
        setSearch('');
        setSelectedIndex(0);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Open palette with Cmd+K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
            setSearch('');
            setSelectedIndex(0);
            return;
        }

        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                setIsOpen(false);
                setSearch('');
                break;
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filteredCommands.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredCommands.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    executeCommand(filteredCommands[selectedIndex]);
                }
                break;
        }
    }, [isOpen, filteredCommands, selectedIndex, executeCommand]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                    <SearchIcon />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search commands..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-zinc-500"
                    />
                    <kbd className="px-2 py-1 text-xs bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                        ESC
                    </kbd>
                </div>

                {/* Command List */}
                <div ref={listRef} className="max-h-80 overflow-auto">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                            <button
                                key={cmd.id}
                                onClick={() => executeCommand(cmd)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${index === selectedIndex
                                        ? 'bg-blue-600/20 text-white'
                                        : 'hover:bg-zinc-800 text-zinc-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {cmd.category && (
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                            {cmd.category}
                                        </span>
                                    )}
                                    <span>{cmd.label}</span>
                                </div>
                                {cmd.shortcut && (
                                    <kbd className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                                        {cmd.shortcut}
                                    </kbd>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-8 text-center text-zinc-500">
                            No commands found for "{search}"
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↓</kbd>
                            navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↵</kbd>
                            select
                        </span>
                    </div>
                    <span>{filteredCommands.length} commands</span>
                </div>
            </div>
        </div>
    );
}

function SearchIcon() {
    return (
        <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

export default CommandPalette;
