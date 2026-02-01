// Host dashboard - HOST and ADMIN only

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { canAccessHost } from '@/lib/rbac';
import Link from 'next/link';

export default async function HostDashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    if (!canAccessHost(session.user.role)) {
        redirect('/dashboard');
    }

    // Fetch Stats
    const listingCount = await db.listing.count({
        where: { hostId: session.user.id },
    });

    // Calculate Earnings (Completed payments for host's listings)
    const earningsAgg = await db.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: 'COMPLETED',
            booking: { listing: { hostId: session.user.id } }
        }
    });
    const totalEarnings = earningsAgg._sum.amount || 0;

    // Active Bookings Count (Confirmed/Pending)
    const activeBookingsCount = await db.booking.count({
        where: {
            listing: { hostId: session.user.id },
            status: { in: ['CONFIRMED', 'PENDING'] }
        }
    });

    const listings = await db.listing.findMany({
        where: { hostId: session.user.id },
        orderBy: { createdAt: 'desc' },
    });

    // Fetch Bookings (Pending & Upcoming)
    const bookings = await db.booking.findMany({
        where: {
            listing: { hostId: session.user.id },
            status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: { listing: true, guest: true },
        orderBy: { createdAt: 'asc' }, // Soonest first
    });

    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED');

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    Host Dashboard
                </h1>
                <Link
                    href="/host/create"
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#FF5A5F',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: '600',
                    }}
                >
                    + Add New Listing
                </Link>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '3rem',
            }}>
                <StatCard label="Properties" value={listingCount} />
                <StatCard label="Active Bookings" value={activeBookingsCount} />
                <StatCard label="Total Earnings" value={`PKR ${totalEarnings.toLocaleString()}`} />
            </div>

            {/* Pending Requests */}
            {pendingBookings.length > 0 && (
                <Section title={`Booking Requests (${pendingBookings.length})`}>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {pendingBookings.map(booking => (
                            <BookingRequestCard key={booking.id} booking={booking} />
                        ))}
                    </div>
                </Section>
            )}

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
                <Section title="Upcoming Bookings">
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {upcomingBookings.map(booking => (
                            <div key={booking.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{booking.listing.title}</div>
                                    <div style={{ color: '#666' }}>{booking.guest.name} · {booking.guestCount} guests</div>
                                    <div style={{ fontSize: '0.9rem' }}>{booking.checkIn.toLocaleDateString()} - {booking.checkOut.toLocaleDateString()}</div>
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#00A699' }}>CONFIRMED</div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Listings List */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', marginTop: '2rem' }}>Your Listings</h2>
            {listings.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>You don't have any listings yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {listings.map(listing => (
                        <div key={listing.id} style={{
                            display: 'flex',
                            gap: '1rem',
                            padding: '1rem',
                            border: '1px solid #eee',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            alignItems: 'center',
                        }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{listing.title}</h3>
                                <p style={{ color: '#666' }}>{listing.city}</p>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>PKR {listing.pricePerNight}</span> / night
                                    <span style={{ marginLeft: '1rem' }}>★ {listing.avgRating.toFixed(1)} ({listing.reviewCount})</span>
                                </div>
                            </div>
                            <div style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                backgroundColor: listing.isActive ? '#e6fffa' : '#fee2e2',
                                color: listing.isActive ? '#00A699' : '#dc2626',
                                fontWeight: '600',
                            }}>
                                {listing.isActive ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
    return (
        <div style={{ backgroundColor: 'white', border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
            <div style={{ color: '#666' }}>{label}</div>
        </div>
    )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{title}</h2>
            {children}
        </div>
    )
}

function BookingRequestCard({ booking }: { booking: any }) {
    // Note: Inline server action imports or separate client components are cleaner, but this works for simple composition if client components handled carefully?
    // Actually, `form action` works fine in SC.
    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'white', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h3 style={{ fontWeight: 'bold' }}>{booking.listing.title}</h3>
                <div style={{ color: '#666', marginBottom: '0.5rem' }}>
                    Guest: <span style={{ fontWeight: '600' }}>{booking.guest.name}</span>
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                    {booking.checkIn.toLocaleDateString()} — {booking.checkOut.toLocaleDateString()} ({booking.guestCount} guests)
                </div>
                <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                    Payout: PKR {booking.totalAmount.toLocaleString()}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <form action={async () => {
                    'use server';
                    const { updateBookingStatus } = await import('@/app/actions/booking');
                    await updateBookingStatus(booking.id, 'REJECTED');
                }}>
                    <button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', color: 'red', cursor: 'pointer' }}>Reject</button>
                </form>
                <form action={async () => {
                    'use server';
                    const { updateBookingStatus } = await import('@/app/actions/booking');
                    await updateBookingStatus(booking.id, 'CONFIRMED');
                }}>
                    <button style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', backgroundColor: '#00A699', color: 'white', cursor: 'pointer' }}>Accept</button>
                </form>
            </div>
        </div>
    )
}
