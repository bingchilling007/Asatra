'use client';

import { suspendUser, reactivateUser } from '@/app/actions/admin';
import { User } from '@prisma/client';
import { useState } from 'react';

export function UserManagement({ users }: { users: User[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleToggleSuspend = async (user: User) => {
        const action = user.suspended ? 'reactivate' : 'suspend';
        if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

        setLoadingId(user.id);
        try {
            if (user.suspended) {
                await reactivateUser(user.id);
            } else {
                await suspendUser(user.id);
            }
        } catch (error) {
            alert(`Failed to ${action} user`);
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', backgroundColor: '#f9f9f9' }}>
                        <th style={{ padding: '0.75rem' }}>Name</th>
                        <th style={{ padding: '0.75rem' }}>Email</th>
                        <th style={{ padding: '0.75rem' }}>Role</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                        <th style={{ padding: '0.75rem' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '0.75rem' }}>{u.name}</td>
                            <td style={{ padding: '0.75rem' }}>{u.email}</td>
                            <td style={{ padding: '0.75rem' }}>
                                <span style={{
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    backgroundColor: u.role === 'ADMIN' ? '#333' : u.role === 'HOST' ? '#00A699' : '#eee',
                                    color: u.role === 'ADMIN' || u.role === 'HOST' ? 'white' : 'black'
                                }}>{u.role}</span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                                {u.suspended ? (
                                    <span style={{ color: 'red', fontWeight: 'bold' }}>SUSPENDED</span>
                                ) : (
                                    <span style={{ color: 'green' }}>Active</span>
                                )}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                                {u.role !== 'ADMIN' && (
                                    <button
                                        onClick={() => handleToggleSuspend(u)}
                                        disabled={loadingId === u.id}
                                        style={{
                                            padding: '0.3rem 0.8rem',
                                            backgroundColor: u.suspended ? '#28a745' : '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {u.suspended ? 'Reactivate' : 'Suspend'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
