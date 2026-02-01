// Registration page

'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
    const { register, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setSubmitting(true);

        try {
            await register(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        boxSizing: 'border-box' as const,
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500' as const,
    };

    return (
        <div>
            <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                textAlign: 'center',
            }}>
                Create Account
            </h1>

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="Ahmed Khan"
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="you@example.com"
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>
                        Phone <span style={{ color: '#999', fontWeight: 'normal' }}>(optional)</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="03001234567"
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="••••••••"
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting || isLoading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#FF5A5F',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1,
                    }}
                >
                    {submitting ? 'Creating Account...' : 'Register'}
                </button>
            </form>

            <p style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                color: '#666',
                fontSize: '0.875rem',
            }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: '#FF5A5F', textDecoration: 'none' }}>
                    Login
                </Link>
            </p>
        </div>
    );
}
