'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav style={{
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--background)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <div className="container" style={{
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo */}
                <Link href="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    ASATRA
                </Link>

                {/* Desktop Links */}
                <div className="desktop-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/search" style={{ fontWeight: 500 }}>Explore</Link>
                    <Link href="/become-host" style={{ fontWeight: 500 }}>List your property</Link>

                    {session?.user ? (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link href="/login" style={{ fontWeight: 500, padding: '0.5rem' }}>Log in</Link>
                            <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign up</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div style={{
                    backgroundColor: 'var(--background)',
                    borderBottom: '1px solid var(--border)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <Link href="/search" onClick={() => setIsMenuOpen(false)}>Explore</Link>
                    <Link href="/become-host" onClick={() => setIsMenuOpen(false)}>List your property</Link>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                    {session?.user ? (
                        <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Dashboard</Link>
                    ) : (
                        <>
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>Log in</Link>
                            <Link href="/register" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign up</Link>
                        </>
                    )}
                </div>
            )}

            {/* Responsive Styles Injection */}
            <style jsx global>{`
        .desktop-nav {
          display: flex;
        }
        .mobile-toggle {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
        </nav>
    );
}
