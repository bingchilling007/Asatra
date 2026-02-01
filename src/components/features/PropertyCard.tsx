import Image from 'next/image';
import Link from 'next/link';
import { Listing, ListingImage } from '@prisma/client';

type PropertyCardProps = {
    listing: Listing & { images: ListingImage[] };
};

export function PropertyCard({ listing }: PropertyCardProps) {
    const coverImage = listing.images[0]?.url || '/placeholder.jpg';

    return (
        <Link
            href={`/rooms/${listing.id}`}
            className="property-card" // Added class for potential global hover targeting
            style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Image Container */}
                <div style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    aspectRatio: '20/19', // More modern square-ish ratio
                    position: 'relative',
                    backgroundColor: 'var(--light-gray)',
                    marginBottom: 'var(--spacing-xs)'
                }}>
                    {listing.images[0] ? (
                        <Image
                            src={coverImage}
                            alt={listing.title}
                            fill
                            style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="card-image" // For hover effect in global or style tag
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                            No Image
                        </div>
                    )}
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: 'var(--foreground)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '70%'
                        }}>
                            {listing.city}, {listing.province}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                            <span>★</span>
                            <span>{listing.avgRating > 0 ? listing.avgRating.toFixed(1) : 'New'}</span>
                        </div>
                    </div>

                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                        Hosted by {listing.hostId ? 'Host' : 'User'} {/* Ideally fetch host name if available */}
                    </p>

                    <div style={{ marginTop: '0.25rem', fontSize: '1rem', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--foreground)' }}>PKR {listing.pricePerNight.toLocaleString()}</span>
                        <span style={{ fontSize: '0.9rem' }}>night</span>
                    </div>
                </div>
            </div>

            {/* Simple hover effect for image zoom */}

        </Link>
    );
}
