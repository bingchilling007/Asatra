'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70vh',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#FF5A5F' }}>
                Something went wrong!
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                We apologize for the inconvenience. An unexpected error occurred.
            </p>
            <button
                onClick={() => reset()}
                className="btn btn-primary"
            >
                Try again
            </button>
        </div>
    );
}
