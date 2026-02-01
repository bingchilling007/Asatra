'use client';

import { approveListing, rejectListing } from '@/app/actions/admin';
import { Listing, User, ListingImage } from '@prisma/client';
import { useState } from 'react';

type ExtendedListing = Listing & {
    host: User;
    images: ListingImage[];
};

export function ListingsModeration({ listings }: { listings: ExtendedListing[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this listing?')) return;
        setLoadingId(id);
        try {
            await approveListing(id);
        } catch (error) {
            alert('Failed to approve');
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        setLoadingId(id);
        try {
            await rejectListing(id, reason);
        } catch (error) {
            alert('Failed to reject');
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    if (listings.length === 0) {
        return <div style={{ color: '#666', fontStyle: 'italic' }}>No pending listings to review.</div>;
    }

    return (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            {listings.map(listing => (
                <div key={listing.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    backgroundColor: '#fff',
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    {listing.images[0] && (
                        <div style={{ width: '150px', height: '100px', flexShrink: 0 }}>
                            <img
                                src={listing.images[0].url}
                                alt={listing.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                            />
                        </div>
                    )}

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                <a href={`/rooms/${listing.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#00A699' }}>
                                    {listing.title}
                                </a>
                            </h3>
                            <span style={{
                                fontSize: '0.8rem',
                                padding: '0.2rem 0.5rem',
                                background: '#ffd700',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}>
                                PENDING
                            </span>
                        </div>

                        <p style={{ margin: '0 0 0.5rem', color: '#666', fontSize: '0.9rem' }}>
                            Host: <strong>{listing.host.name}</strong> ({listing.host.email})
                        </p>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem' }}>
                            {listing.city}, {listing.province} • PKR {listing.pricePerNight}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => handleApprove(listing.id)}
                                disabled={loadingId === listing.id}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#008489',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    opacity: loadingId === listing.id ? 0.7 : 1
                                }}
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleReject(listing.id)}
                                disabled={loadingId === listing.id}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#d9534f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    opacity: loadingId === listing.id ? 0.7 : 1
                                }}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
