import { useState } from 'react';
import { Star } from 'lucide-react';

const LABELS = ['', 'Loše', 'Zadovoljava', 'Dobro', 'Vrlo dobro', 'Odlično'];

export default function StarRating({ value, onChange, readonly = false, size = 28 }) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => !readonly && onChange?.(star)}
                        onMouseEnter={() => !readonly && setHovered(star)}
                        onMouseLeave={() => !readonly && setHovered(0)}
                        className={`transition-transform ${
                            readonly
                                ? 'cursor-default'
                                : 'cursor-pointer hover:scale-110 active:scale-95'
                        }`}
                    >
                        <Star
                            size={size}
                            className={`transition-colors duration-100 ${
                                star <= active
                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                                    : 'text-slate-200 fill-slate-100'
                            }`}
                        />
                    </button>
                ))}
            </div>

            {!readonly && active > 0 && (
                <p className="text-xs font-medium text-slate-500">
                    {LABELS[active]}
                </p>
            )}
        </div>
    );
}