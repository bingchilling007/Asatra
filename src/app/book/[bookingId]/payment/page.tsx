import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { payForBooking } from '@/app/actions/payment';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function PaymentPage(props: { params: Promise<{ bookingId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user) redirect('/login');

    const booking = await db.booking.findUnique({
        where: { id: params.bookingId },
        include: { listing: true },
    });

    if (!booking) notFound();
    if (booking.guestId !== session.user.id) redirect('/dashboard');

    // If already paid, redirect
    const payment = await db.payment.findUnique({ where: { bookingId: booking.id } });
    if (payment?.status === 'COMPLETED') redirect('/dashboard');

    return (
        <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '12px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Complete your payment</h1>

            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{booking.listing.title}</h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>{booking.listing.city}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                    <span style={{ fontWeight: 'bold' }}>Total Amount</span>
                    <span style={{ fontWeight: 'bold' }}>PKR {booking.totalAmount.toLocaleString()}</span>
                </div>
            </div>

            <form action={payForBooking.bind(null, booking.id)}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Select Payment Method</h3>

                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="method" value="EASYPAISA" defaultChecked />
                        <div style={{ fontWeight: 'bold' }}>EasyPaisa</div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="method" value="JAZZCASH" />
                        <div style={{ fontWeight: 'bold' }}>JazzCash</div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="method" value="BANK_TRANSFER" />
                        <div style={{ fontWeight: 'bold' }}>Bank Transfer</div>
                    </label>
                </div>

                <SubmitButton style={{ width: '100%', fontSize: '1.1rem' }}>
                    Pay PKR {booking.totalAmount.toLocaleString()}
                </SubmitButton>
            </form>
        </div>
    );
}
