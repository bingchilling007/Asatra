import { auth } from '@/lib/auth';
import { getListingById } from '@/lib/data/listing';
import { notFound } from 'next/navigation';
import { ImageGallery } from '@/components/features/ImageGallery';
import { BookingWidget } from '@/components/features/BookingWidget';
import { ReviewList } from '@/components/features/ReviewList';
import { AMENITIES_LIST } from '@/types';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function ListingDetailPage(props: PageProps) {
    const params = await props.params;
    const session = await auth();
    const listing = await getListingById(params.id);

    if (!listing) {
        notFound();
    }

    // Amenities mapping
    const amenities = AMENITIES_LIST.filter(a => listing.amenities.includes(a.id));

    return (
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--spacing-lg) var(--spacing-sm)' }}>
            {/* Header */}
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--foreground)' }}>{listing.title}</h1>
            <div style={{ marginBottom: '1.5rem', textDecoration: 'underline', fontWeight: '500', color: 'var(--foreground)' }}>
                {listing.city}, {listing.province}, Pakistan
            </div>

            {/* Gallery */}
            <ImageGallery images={listing.images} />

            {/* Main Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--spacing-xl)' }} className="detail-layout">
                {/* Style hack for responsive */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          @media (max-width: 768px) {
            .detail-layout { grid-template-columns: 1fr !important; gap: var(--spacing-lg) !important; }
          }
        `}} />

                {/* Left Column */}
                <div className="main-content">
                    {/* Host Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--foreground)' }}>Hosted by {listing.host.name}</h2>
                            <p style={{ color: 'var(--muted)' }}>{listing.maxGuests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} baths</p>
                        </div>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--light-gray)', overflow: 'hidden' }}>
                            {listing.host.avatarUrl && <img src={listing.host.avatarUrl} alt={listing.host.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '2rem', whiteSpace: 'pre-line', fontSize: '1rem', lineHeight: '1.6', color: 'var(--foreground)' }}>
                        {listing.description}
                    </div>

                    {/* Amenities */}
                    <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2rem 0' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--foreground)' }}>What this place offers</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {amenities.map(a => (
                                <div key={a.id} style={{ display: 'flex', gap: '0.5rem', color: 'var(--foreground)' }}>
                                    <span>✓</span> {a.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div style={{ padding: '2rem 0' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--foreground)' }}>
                            ★ {listing.reviews.length > 0 ? `${listing.reviews.length} Reviews` : 'No reviews yet'}
                        </h3>
                        <ReviewList reviews={listing.reviews} isOwner={session?.user?.id === listing.hostId} />
                    </div>
                </div>

                {/* Right Column (Sticky) */}
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <BookingWidget
                            pricePerNight={listing.pricePerNight}
                            listingId={listing.id}
                            bookedDates={listing.bookings}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
