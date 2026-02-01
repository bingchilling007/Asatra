'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { BookingStatus, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { logger } from '@/lib/logger';

const bookingSchema = z.object({
  listingId: z.string(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  guests: z.coerce.number().min(1),
  pricePerNight: z.coerce.number(),
});

export async function createBooking(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  // Verify user existence
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
      redirect('/login?error=Session expired. Please log in again.');
  }

  const rawData = {
    listingId: formData.get('listingId'),
    checkIn: formData.get('checkIn'),
    checkOut: formData.get('checkOut'),
    guests: formData.get('guests'),
    pricePerNight: formData.get('pricePerNight'),
  };

  const validated = bookingSchema.safeParse(rawData);

  if (!validated.success) {
      const errorMessage = validated.error.errors[0].message;
      // Redirect back to listing if possible, or home.
      // We need listingId to redirect back.
      const listingId = rawData.listingId as string;
      if (listingId) {
          redirect(`/rooms/${listingId}?error=${encodeURIComponent(errorMessage)}`);
      }
      redirect(`/?error=${encodeURIComponent(errorMessage)}`);
  }

  const data = validated.data;

  // Validate dates
  if (data.checkIn >= data.checkOut) {
    redirect(`/rooms/${data.listingId}?error=${encodeURIComponent('Check-out must be after check-in')}`);
  }

  const now = new Date();
  now.setHours(0,0,0,0);
  if (data.checkIn < now) {
    redirect(`/rooms/${data.listingId}?error=${encodeURIComponent('Cannot book dates in the past')}`);
  }

  // Check for conflicts
  const conflicts = await db.booking.findFirst({
    where: {
      listingId: data.listingId,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      AND: [
        { checkIn: { lt: data.checkOut } },
        { checkOut: { gt: data.checkIn } },
      ],
    },
  });

  if (conflicts) {
    redirect(`/rooms/${data.listingId}?error=${encodeURIComponent('Selected dates are not available')}`);
  }

  // Fetch listing for secure pricing
  const listing = await db.listing.findUnique({ where: { id: data.listingId } });
  if (!listing) redirect(`/?error=${encodeURIComponent('Listing not found')}`);

  // Calculate Financials securely
  const nights = Math.ceil((data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const realPrice = listing.pricePerNight;
  const realCleaning = listing.cleaningFee;
  const realSubtotal = realPrice * nights;
  const serviceFee = Math.round(realSubtotal * 0.05);
  const totalAmount = realSubtotal + realCleaning + serviceFee;



  const createdBooking = await db.booking.create({
    data: {
      guestId: session.user.id,
      listingId: data.listingId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestCount: data.guests,
      nightlyRate: realPrice,
      nights,
      subtotal: realSubtotal,
      cleaningFee: realCleaning,
      serviceFee,
      totalAmount,
      status: BookingStatus.PENDING,
    },
  });

  logger.info('Booking created', { bookingId: createdBooking.id, userId: session.user.id, amount: totalAmount });

  // Redirect to Payment
  redirect(`/book/${createdBooking.id}/payment`);
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  // Validate inputs
  if (!Object.values(BookingStatus).includes(status)) {
    throw new Error('Invalid status');
  }

  // Verify host ownership & existence
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error('Unauthorized');

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  });

  if (!booking || booking.listing.hostId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  await db.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  if (status === BookingStatus.REJECTED) {
    // Import dynamically to avoid circle if needed, or just standard
    // Ideally separate file structure avoids cycles. 
    // actions/booking and actions/payment might cycle if not careful.
    // payment actions import db, auth... booking actions import db, auth. 
    // No direct dependency cycle if simple import.
    // However, payment actions redirect...
    // Let's use dynamic import to be safe in this big file.
    const { refundBooking } = await import('./payment');
    await refundBooking(bookingId);
  }

  revalidatePath('/host');
  revalidatePath('/dashboard');
}
