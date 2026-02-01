import { getListings, SearchParams } from '@/lib/data/listing';
import { PropertyCard } from '@/components/features/PropertyCard';
import { SearchFilters } from '@/components/features/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';
import { Suspense } from 'react';

// Force dynamic because of searchParams usage
export const dynamic = 'force-dynamic';

export default async function SearchPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;
    const { listings, totalCount, totalPages, currentPage } = await getListings(searchParams);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'none' }}>
                    Search Properties
                </h1>

                {/* Mobile Header logic could go here */}
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }} className="search-layout">
                {/* Need responsive CSS, using inline for MVP structure but media queries required for true sidebar behavior.
             Added class 'search-layout' to handle media query if we add CSS file, or just use grid.
          */}
                <style dangerouslySetInnerHTML={{
                    __html: `
           @media (min-width: 768px) {
             .search-layout {
               flex-direction: row !important;
             }
             .filters-sidebar {
               width: 300px;
               flex-shrink: 0;
             }
             .results-grid {
               flex: 1;
             }
           }
         `}} />

                <aside className="filters-sidebar">
                    <Suspense fallback={<div>Loading filters...</div>}>
                        <SearchFilters />
                    </Suspense>
                </aside>

                <main className="results-grid">
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            {totalCount} {totalCount === 1 ? 'place' : 'places'} found
                            {searchParams.city && ` in ${searchParams.city}`}
                        </h2>
                        {/* Sort dropdown could go here in future */}
                    </div>

                    {listings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
                            <h3>No properties found</h3>
                            <p>Try adjusting your filters or search for a different city.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {listings.map(listing => (
                                    <PropertyCard key={listing.id} listing={listing} />
                                ))}
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                searchParams={searchParams}
                                baseUrl="/search"
                            />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
