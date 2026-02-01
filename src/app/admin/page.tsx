// Admin panel - ADMIN only

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { canAccessAdmin } from '@/lib/rbac';
import Link from 'next/link';
import { ListingsModeration } from '@/components/admin/ListingsModeration';
import { UserManagement } from '@/components/admin/UserManagement';
import { DisputeManagement } from '@/components/admin/DisputeManagement';
import { ListingStatus } from '@prisma/client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    if (!canAccessAdmin(session.user.role)) {
        redirect('/dashboard');
    }

    // Fetch Stats
    const userCount = await db.user.count();
    const listingCount = await db.listing.count();
    const bookingCount = await db.booking.count();
    const paymentAgg = await db.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
    });
    const totalRevenue = paymentAgg._sum.amount || 0;

    // Fetch Data for Moderation Tools

    // 1. Pending Listings
    const pendingListings = await db.listing.findMany({
        where: { status: ListingStatus.PENDING },
        include: { host: true, images: true },
        orderBy: { createdAt: 'desc' }
    });

    // 2. Users (Take recent 20 for MVP management)
    const users = await db.user.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
    });

    // 3. Disputes
    const disputes = await db.dispute.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            openedBy: true,
            booking: {
                include: {
                    listing: true,
                    guest: true, // Needed for context
                }
            }
        }
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Admin Panel</h1>
                <Link href="/dashboard" style={{ color: '#00A699', fontWeight: '600' }}>← Back to Dashboard</Link>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                <StatCard title="Total Users" value={userCount} />
                <StatCard title="Properties" value={listingCount} />
                <StatCard title="Total Bookings" value={bookingCount} />
                <StatCard title="Total Revenue" value={`PKR ${totalRevenue.toLocaleString()}`} />
            </div>

            {/* Moderation Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                <Section title={`Pending Listings (${pendingListings.length})`}>
                    <ListingsModeration listings={pendingListings} />
                </Section>

                <Section title="Dispute Resolution">
                    <DisputeManagement disputes={disputes} />
                </Section>

                <Section title="User Management">
                    <UserManagement users={users} />
                </Section>

            </div>
        </div>
    );
}

function StatCard({ title, value }: { title: string, value: string | number }) {
    return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{value}</div>
            <div style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</div>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>{title}</h2>
            {children}
        </div>
    )
}
