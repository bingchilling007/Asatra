'use client';

import { useState } from 'react';
import { replyToReview } from '@/app/actions/review';

export function ReviewResponseForm({ reviewId }: { reviewId: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#00A699', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: '600' }}
            >
                Reply to review
            </button>
        );
    }

    return (
        <form action={async (formData) => {
            const response = formData.get('response') as string;
            await replyToReview(reviewId, response);
            setIsExpanded(false);
        }} style={{ marginTop: '0.5rem' }}>
            <textarea
                name="response"
                placeholder="Write your response..."
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9rem' }}
            />
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button
                    type="submit"
                    style={{ padding: '0.25rem 0.75rem', backgroundColor: '#00A699', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                    Post Response
                </button>
                <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    style={{ padding: '0.25rem 0.75rem', backgroundColor: '#ddd', color: 'black', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
