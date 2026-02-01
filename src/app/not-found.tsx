import Link from 'next/link';

export default function NotFound() {
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
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>404</h2>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h3>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                The page you are looking for does not exist or has been moved.
            </p>
            <Link href="/" className="btn btn-primary">
                Return Home
            </Link>
        </div>
    );
}
