'use client';

interface PageCounterProps {
    current: number;
    total: number;
    type?: 'page' | 'chapter' | 'percent';
}

export default function PageCounter({ current, total, type = 'page' }: PageCounterProps) {
    if (total === 0) return null;

    const getDisplayText = () => {
        switch (type) {
            case 'percent':
                return `${Math.round(current)}%`;
            case 'chapter':
                return `Chapter ${current} of ${total}`;
            case 'page':
            default:
                return `Page ${current} of ${total}`;
        }
    };

    return (
        <div className="fixed bottom-20 right-6 z-40 bg-slate-800/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg">
            <span className="text-sm font-medium">
                {getDisplayText()}
            </span>
        </div>
    );
}
