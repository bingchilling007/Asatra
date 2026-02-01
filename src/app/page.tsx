// ASATRA Homepage

import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>

      {/* Hero Section */}
      <main className="container" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--spacing-xl) var(--spacing-sm)',
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '800',
          marginBottom: 'var(--spacing-md)',
          color: 'var(--foreground)',
          maxWidth: '800px',
        }}>
          Discover Unique Stays Across <span style={{ color: 'var(--secondary)' }}>Pakistan</span>
        </h1>
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--muted)',
          marginBottom: 'var(--spacing-lg)',
          maxWidth: '600px',
        }}>
          Book trusted stays — verified properties, local payments, Urdu support.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/search"
            className="btn btn-primary"
            style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}
          >
            Explore Properties
          </Link>
          <Link
            href="/become-host"
            className="btn btn-secondary"
            style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}
          >
            Become a Host
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: 'var(--spacing-lg) 0',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        color: 'var(--muted)',
        marginTop: 'auto'
      }}>
        <p>© 2026 ASATRA. Pakistan&apos;s trusted rental platform.</p>
      </footer>
    </div>
  );
}
