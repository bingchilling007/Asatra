import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { createReview } from '@/app/actions/review';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function ReviewPage(props: { params: Promise<{ bookingId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const booking = await db.booking.findUnique({
        where: { id: params.bookingId },
        include: { listing: true },
    });

    if (!booking) notFound();
    if (booking.guestId !== session.user.id) redirect('/dashboard');

    // Verify eligibility (e.g. check status or dates)
    // For UI friendliness, handled here too

    const existingReview = await db.review.findUnique({
        where: { bookingId: booking.id },
    });

    if (existingReview) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>You have already reviewed this stay.</h1>
                <a href={`/rooms/${booking.listingId}`}>Go to listing</a>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '12px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Review your stay</h1>
            <h3 style={{ color: '#666', marginBottom: '2rem' }}>{booking.listing.title}</h3>

            <form action={createReview}>
                <input type="hidden" name="bookingId" value={booking.id} />

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Rating (1-5)</label>
                    <select name="rating" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Okay</option>
                        <option value="2">2 - Poor</option>
                        <option value="1">1 - Terrible</option>
                    </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Describe your experience</label>
                    <textarea
                        name="comment"
                        required
                        rows={5}
                        placeholder="What did you love? What could be improved?"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    ></textarea>
                </div>

                <SubmitButton style={{ width: '100%' }}>Submit Review</SubmitButton>
            </form>
        </div>
    );
}
