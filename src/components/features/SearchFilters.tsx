'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { PropertyType } from '@prisma/client';

export function SearchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [minPrice, setMinPrice] = useState(searchParams.get('min') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '');
    const [type, setType] = useState(searchParams.get('type') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');

    const handleApply = () => {
        const params = new URLSearchParams(searchParams);
        if (minPrice) params.set('min', minPrice); else params.delete('min');
        if (maxPrice) params.set('max', maxPrice); else params.delete('max');
        if (type) params.set('type', type); else params.delete('type');
        if (city) params.set('city', city); else params.delete('city');
        params.delete('page'); // Reset pagination

        startTransition(() => {
            router.push(`/search?${params.toString()}`);
        });
    };

    const handleClear = () => {
        setMinPrice('');
        setMaxPrice('');
        setType('');
        setCity('');
        router.push('/search');
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Filters</h3>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Location</label>
                <input
                    type="text"
                    placeholder="Enter city..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Price Range</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        style={{ width: '50%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        style={{ width: '50%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Property Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                    <option value="">Any</option>
                    {Object.values(PropertyType).map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={handleApply}
                    disabled={isPending}
                    className="btn btn-primary"
                    style={{
                        flex: 1,
                        opacity: isPending ? 0.7 : 1
                    }}
                >
                    {isPending ? 'Updating...' : 'Apply Filters'}
                </button>
                <button
                    onClick={handleClear}
                    className="btn btn-secondary"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
