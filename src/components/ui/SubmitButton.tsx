'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({ children, style, className }: { children: React.ReactNode, style?: React.CSSProperties, className?: string }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={`btn btn-primary ${className || ''}`}
            style={{
                width: '100%', // Default to full width for submit buttons usually
                cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.7 : 1,
                ...style,
            }}
        >
            {pending ? 'Processing...' : children}
        </button>
    );
}
