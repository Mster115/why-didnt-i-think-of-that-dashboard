'use client';

import { PolymarketCategory } from '@/hooks/usePolymarket';

interface CategoryFilterProps {
    selected: PolymarketCategory;
    onChange: (category: PolymarketCategory) => void;
}

const CATEGORIES: { value: PolymarketCategory; label: string; color: string }[] = [
    { value: 'politics', label: 'Politics', color: 'bg-red-500' },
    { value: 'crypto', label: 'Crypto', color: 'bg-orange-500' },
    { value: 'sports', label: 'Sports', color: 'bg-green-500' },
    { value: 'pop-culture', label: 'Pop Culture', color: 'bg-purple-500' },
    { value: 'business', label: 'Business', color: 'bg-blue-500' },
    { value: 'all', label: 'All', color: 'bg-zinc-500' },
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
    return (
        <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
                <button
                    key={cat.value}
                    onClick={() => onChange(cat.value)}
                    className={`
            flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors
            ${selected === cat.value
                            ? 'bg-zinc-800 text-white border border-zinc-600'
                            : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                        }
          `}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                    {cat.label}
                </button>
            ))}
        </div>
    );
}

export default CategoryFilter;
