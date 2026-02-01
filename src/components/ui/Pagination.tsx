import Link from 'next/link';
import { SearchParams } from '@/lib/data/listing';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    searchParams: SearchParams;
    baseUrl: string;
};

export function Pagination({ currentPage, totalPages, searchParams, baseUrl }: PaginationProps) {
    if (totalPages <= 1) return null;

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams as Record<string, string>);
        params.set('page', page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            {currentPage > 1 && (
                <Link href={createPageUrl(currentPage - 1)} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    &lt; Previous
                </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Link
                    key={page}
                    href={createPageUrl(page)}
                    style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: currentPage === page ? '#222' : 'transparent',
                        color: currentPage === page ? 'white' : '#222',
                        textDecoration: 'none',
                    }}
                >
                    {page}
                </Link>
            ))}

            {currentPage < totalPages && (
                <Link href={createPageUrl(currentPage + 1)} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    Next &gt;
                </Link>
            )}
        </div>
    );
}
