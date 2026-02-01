import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { canAccessHost, canAccessAdmin } from '@/lib/rbac';
import { BookingStatus } from '@prisma/client';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const user = session.user;
    const isHost = canAccessHost(user.role);
    const isAdmin = canAccessAdmin(user.role);

    const myBookings = await db.booking.findMany({
        where: { guestId: session.user.id },
        include: { listing: true, review: true },
        orderBy: { createdAt: 'desc' },
    });

    const myReviews = await db.review.findMany({
        where: { authorId: session.user.id },
        include: { listing: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        Welcome, {user.name}
                    </h1>
                    <p style={{ color: '#666' }}>{user.email}</p>
                </div>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden' }}>
                    {user.image && <img src={user.image} alt={user.name!} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {!user.image && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#666' }}>{user.name?.[0]}</div>}
                </div>
            </header>

            {/* Guest: My Trips */}
            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>My Trips</h2>
                {myBookings.length === 0 ? (
                    <div style={{ padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '1rem', color: '#666' }}>No trips booked yet.</p>
                        <Link href="/search" style={{ color: '#FF5A5F', fontWeight: 'bold' }}>Find a place to stay</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {myBookings.map(booking => (
                            <div key={booking.id} style={{
                                border: '1px solid #ddd',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                backgroundColor: 'white',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                    <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        <Link href={`/rooms/${booking.listingId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {booking.listing.title}
                                        </Link>
                                    </h3>
                                    <span style={{
                                        fontWeight: 'bold',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        backgroundColor: booking.status === 'CONFIRMED' ? '#e6fffa' : booking.status === 'PENDING' ? '#fffbeb' : '#fee2e2',
                                        color: booking.status === 'CONFIRMED' ? '#00A699' : booking.status === 'PENDING' ? '#b45309' : '#dc2626'
                                    }}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div style={{ color: '#666' }}>
                                    {booking.checkIn.toLocaleDateString()} — {booking.checkOut.toLocaleDateString()}
                                </div>
                                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '500' }}>PKR {booking.totalAmount.toLocaleString()}</span>

                                    {/* Review Button */}
                                    {['CONFIRMED', 'COMPLETED'].includes(booking.status) && !booking.review && (
                                        <Link
                                            href={`/book/${booking.id}/review`}
                                            style={{ fontSize: '0.9rem', color: '#FF5A5F', fontWeight: '600', textDecoration: 'none' }}
                                        >
                                            Write a Review
                                        </Link>
                                    )}
                                    {booking.review && (
                                        <span style={{ fontSize: '0.9rem', color: '#00A699' }}>✓ Reviewed</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* My Reviews */}
            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>My Reviews</h2>
                {myReviews.length === 0 ? (
                    <p style={{ color: '#666' }}>You haven't written any reviews yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {myReviews.map(review => (
                            <div key={review.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                    {review.listing.title} <span style={{ fontWeight: 'normal', color: '#666' }}>({new Date(review.createdAt).toLocaleDateString()})</span>
                                </div>
                                <div>
                                    <span style={{ color: '#FFB400' }}>{'★'.repeat(review.rating)}</span>
                                    <span style={{ color: '#ddd' }}>{'★'.repeat(5 - review.rating)}</span>
                                </div>
                                <p style={{ marginTop: '0.5rem' }}>{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Actions */}
            <section style={{ borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {!isHost && (
                        <Link
                            href="/become-host"
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: 'white',
                                border: '1px solid #FF5A5F',
                                color: '#FF5A5F',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontWeight: '600'
                            }}
                        >
                            List your property
                        </Link>
                    )}

                    {isHost && (
                        <Link
                            href="/host"
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#00A699',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontWeight: '600'
                            }}
                        >
                            Go to Host Dashboard
                        </Link>
                    )}

                    {isAdmin && (
                        <Link
                            href="/admin"
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#333',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                            }}
                        >
                            Admin Panel
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
