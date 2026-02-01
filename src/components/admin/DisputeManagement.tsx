'use client';

import { resolveDispute } from '@/app/actions/admin';
import { Dispute, DisputeStatus, User, Booking, Listing } from '@prisma/client';
import { useState } from 'react';

type ExtendedDispute = Dispute & {
    openedBy: User;
    booking: Booking & {
        listing: Listing;
        guest: User; // Assuming guest is needed context, though openedBy might be guest
    };
};

export function DisputeManagement({ disputes }: { disputes: ExtendedDispute[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleResolve = async (id: string, newStatus: DisputeStatus) => {
        const resolution = prompt('Enter resolution details/comment:');
        if (!resolution) return;

        setLoadingId(id);
        try {
            await resolveDispute(id, resolution, newStatus);
        } catch (error) {
            alert('Failed to update dispute');
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    if (disputes.length === 0) {
        return <div style={{ color: '#666', fontStyle: 'italic' }}>No open disputes.</div>;
    }

    return (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            {disputes.map(d => (
                <div key={d.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    backgroundColor: '#fff'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                            {d.category} - {d.booking.listing.title}
                        </h3>
                        <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            backgroundColor: d.status === 'OPEN' ? '#dc3545' : '#ffc107',
                            color: d.status === 'OPEN' ? 'white' : 'black'
                        }}>
                            {d.status}
                        </span>
                    </div>

                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Opened by <strong>{d.openedBy.name}</strong> on {new Date(d.createdAt).toLocaleDateString()}
                    </p>

                    <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '1rem' }}>
                        {d.description}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Resolve:</span>
                        <button
                            onClick={() => handleResolve(d.id, 'RESOLVED')}
                            disabled={loadingId === d.id}
                            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Resolve
                        </button>
                        <button
                            onClick={() => handleResolve(d.id, 'DISMISSED')}
                            disabled={loadingId === d.id}
                            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
