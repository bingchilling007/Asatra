'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { paymentAdapter } from '@/lib/payment/adapter';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function payForBooking(bookingId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.guestId !== session.user.id) {
    throw new Error('Unauthorized or Booking not found');
  }

  if (booking.status !== 'PENDING') {
    // throw new Error('Booking is not in pending state');
    // Allow payment for now even if confirmed? Usually payment comes first.
    // Assuming flow: Request -> Pending -> Pay -> Pending(Paid).
  }
  
  // Check if already paid
  const existingPayment = await db.payment.findUnique({ where: { bookingId }});
  if (existingPayment && existingPayment.status === 'COMPLETED') {
     throw new Error('Booking already paid');
  }

  const method = formData.get('method') as string; // 'CARD', 'EASYPAISA', etc.
  // Validate method against enum
  let dbMethod: PaymentMethod = PaymentMethod.BANK_TRANSFER; // Default
  if (method === 'EASYPAISA') dbMethod = PaymentMethod.EASYPAISA;
  if (method === 'JAZZCASH') dbMethod = PaymentMethod.JAZZCASH;

  // Process Payment
  const result = await paymentAdapter.charge(
    booking.totalAmount, 
    'PKR', 
    method, 
    {}
  );

  if (!result.success) {
    throw new Error(result.error || 'Payment failed');
  }

  // Record Payment
  await db.payment.create({
    data: {
      bookingId: booking.id,
      amount: booking.totalAmount,
      currency: 'PKR',
      method: dbMethod,
      status: PaymentStatus.COMPLETED,
      gatewayRef: result.transactionId,
      paidAt: new Date(),
    },
  });

  // Redirect to dashboard with success
  revalidatePath('/dashboard');
  redirect('/dashboard?payment=success');
}

export async function refundBooking(bookingId: string) {
  // Internal function to be called when Host rejects or Admin refunds
  const payment = await db.payment.findUnique({ where: { bookingId } });
  if (!payment || payment.status !== 'COMPLETED' || !payment.gatewayRef) {
    return false;
  }

  const result = await paymentAdapter.refund(payment.gatewayRef, payment.amount);
  if (result.success) {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.REFUNDED },
    });
    return true;
  }
  return false;
}
