'use client';

import { useState } from 'react';
import { createBooking } from '@/app/actions/booking';
import { SubmitButton } from '@/components/ui/SubmitButton';

type BookingWidgetProps = {
    pricePerNight: number;
    listingId: string;
    bookedDates: { checkIn: Date; checkOut: Date }[];
};

export function BookingWidget({ pricePerNight, listingId, bookedDates }: BookingWidgetProps) {
    const [nights, setNights] = useState(1);
    const [guests, setGuests] = useState(1);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    // Basic calculation
    const subtotal = pricePerNight * nights;
    const serviceFee = Math.round(subtotal * 0.05);
    const cleaningFee = 2000;
    const total = subtotal + serviceFee + cleaningFee;

    const handleDateChange = (type: 'start' | 'end', val: string) => {
        if (type === 'start') {
            setCheckIn(val);
            // Logic to auto-set end date?
            // For MVP, just set state.
            // Recalc nights if both set
            if (checkOut) {
                const start = new Date(val);
                const end = new Date(checkOut);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 0) setNights(diffDays);
            }
        } else {
            setCheckOut(val);
            if (checkIn) {
                const start = new Date(checkIn);
                const end = new Date(val);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 0) setNights(diffDays);
            }
        }
    };

    // Conflict Check (Visual helper - full check on server)
    const isConflict = () => {
        if (!checkIn || !checkOut) return false;
        const s = new Date(checkIn);
        const e = new Date(checkOut);
        return bookedDates.some(b => {
            const bs = new Date(b.checkIn);
            const be = new Date(b.checkOut);
            return s < be && e > bs;
        });
    };

    return (
        <div style={{
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '12px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            position: 'sticky',
            top: '100px',
            backgroundColor: 'white',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                <div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>PKR {pricePerNight.toLocaleString()}</span>
                    <span style={{ color: '#666' }}> / night</span>
                </div>
            </div>

            <form action={createBooking}>
                <input type="hidden" name="listingId" value={listingId} />
                <input type="hidden" name="pricePerNight" value={pricePerNight} />

                <div style={{ display: 'flex', border: '1px solid #aaa', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, padding: '0.5rem', borderRight: '1px solid #aaa' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold', display: 'block' }}>CHECK-IN</label>
                        <input
                            type="date"
                            name="checkIn"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                            style={{ border: 'none', width: '100%', outline: 'none' }}
                        />
                    </div>
                    <div style={{ flex: 1, padding: '0.5rem' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold', display: 'block' }}>CHECK-OUT</label>
                        <input
                            type="date"
                            name="checkOut"
                            required
                            min={checkIn || new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                            style={{ border: 'none', width: '100%', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ padding: '0.5rem', border: '1px solid #aaa', borderRadius: '8px', marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 'bold', display: 'block' }}>GUESTS</label>
                    <select
                        name="guests"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        style={{ width: '100%', border: 'none', outline: 'none' }}
                    >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>)}
                    </select>
                </div>

                {isConflict() && (
                    <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        selected dates are unavailable.
                    </div>
                )}

                <SubmitButton style={{ width: '100%', fontSize: '1.2rem' }}>
                    Reserve
                </SubmitButton>
            </form>

            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ textDecoration: 'underline' }}>PKR {pricePerNight.toLocaleString()} x {nights} nights</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ textDecoration: 'underline' }}>Cleaning fee</span>
                    <span>PKR {cleaningFee.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ textDecoration: 'underline' }}>Service fee</span>
                    <span>PKR {serviceFee.toLocaleString()}</span>
                </div>
                <hr style={{ margin: '1rem 0', borderTop: '1px solid #ddd' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#222', fontSize: '1.1rem' }}>
                    <span>Total</span>
                    <span>PKR {total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
