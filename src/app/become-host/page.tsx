// Become a Host Page - Profile Setup

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createHostProfile } from '@/app/actions/host';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { canAccessHost } from '@/lib/rbac';

type PageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BecomeHostPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const error = searchParams.error as string | undefined;
    const session = await auth();

    if (!session?.user) {
        redirect('/login?callbackUrl=/become-host');
    }

    // If already a host, redirect to host dashboard
    if (canAccessHost(session.user.role)) {
        redirect('/host');
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Become a Host on ASATRA
            </h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Share your space, earn extra income, and meet people from all over Pakistan.
                To get started, please complete your host profile.
            </p>

            {error && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#ffebe9',
                    border: '1px solid #ff818266',
                    borderRadius: '6px',
                    marginBottom: '1.5rem',
                    color: '#d93025'
                }}>
                    <strong>Error:</strong> {decodeURIComponent(error)}
                </div>
            )}

            <form action={createHostProfile}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        About You (Bio)
                    </label>
                    <textarea
                        name="bio"
                        required
                        rows={5}
                        minLength={10}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '1rem',
                        }}
                        placeholder="Tell guests a bit about yourself and why you're hosting... (min 10 chars)"
                    />
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Payout Information
                </h2>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Bank Name
                    </label>
                    <input
                        type="text"
                        name="bankName"
                        required
                        minLength={3}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '1rem',
                        }}
                        placeholder="e.g. Meezan Bank, JazzCash"
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Account Number / IBAN
                    </label>
                    <input
                        type="text"
                        name="accountNumber"
                        required
                        minLength={5}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '1rem',
                        }}
                        placeholder="PK..."
                    />
                </div>

                <SubmitButton style={{ width: '100%' }}>
                    Complete Profile
                </SubmitButton>
            </form>
        </div>
    );
}
