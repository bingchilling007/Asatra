import { Review } from '@prisma/client';
import { ReviewResponseForm } from './ReviewResponseForm';

type ReviewWithAuthor = Review & {
    author: {
        name: string;
        avatarUrl: string | null;
        createdAt: Date;
    }
};

export function ReviewList({ reviews, isOwner }: { reviews: ReviewWithAuthor[], isOwner?: boolean }) {
    if (reviews.length === 0) return <div>No reviews yet.</div>;

    return (
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {reviews.map(review => (
                <div key={review.id}>
                    {/* Author Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {review.author.avatarUrl ? (
                                <img src={review.author.avatarUrl} alt={review.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span>{review.author.name[0]}</span>
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{review.author.name}</div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <span style={{ fontWeight: 'bold' }}>★ {review.rating}</span>
                        <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{review.comment}</p>

                        {/* Response */}
                        {review.response && (
                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', borderLeft: '3px solid #00A699' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Response from Host:</div>
                                <div style={{ color: '#555' }}>{review.response}</div>
                            </div>
                        )}

                        {/* Reply Form (Owner only) */}
                        {!review.response && isOwner && (
                            <ReviewResponseForm reviewId={review.id} />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
