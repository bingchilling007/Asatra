'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10),
});

export async function createReview(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  // Verify user existence
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    redirect('/login?error=Session expired');
  }

  const rawData = {
    bookingId: formData.get('bookingId'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  };

  const validated = reviewSchema.safeParse(rawData);

  if (!validated.success) {
    redirect(`/?error=${encodeURIComponent(validated.error.errors[0].message)}`);
  }
  
  const data = validated.data;

  // Validate Booking
  const booking = await db.booking.findUnique({
    where: { id: data.bookingId },
    include: { listing: true },
  });

  if (!booking || booking.guestId !== session.user.id) {
    redirect(`/?error=${encodeURIComponent('Unauthorized or Booking not found')}`);
  }

  // Check Eligibility
  // Must be CONFIRMED or COMPLETED
  // Note: Usually review is after stay.
  if (!['CONFIRMED', 'COMPLETED'].includes(booking.status)) {
     redirect(`/rooms/${booking.listingId}?error=${encodeURIComponent('Booking must be completed to leave a review')}`);
  }

  // Check Already Reviewed
  const existing = await db.review.findUnique({
    where: { bookingId: data.bookingId },
  });

  if (existing) {
    redirect(`/rooms/${booking.listingId}?error=${encodeURIComponent('You have already reviewed this stay')}`);
  }

  // Create Review
  await db.review.create({
    data: {
      bookingId: data.bookingId,
      listingId: booking.listingId,
      authorId: session.user.id,
      subjectId: booking.listing.hostId, // Reviewing the specific listing but also tagging host
      rating: data.rating,
      comment: data.comment,
    },
  });

  // Aggregate Stats
  const aggs = await db.review.aggregate({
    where: { listingId: booking.listingId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await db.listing.update({
    where: { id: booking.listingId },
    data: {
      avgRating: aggs._avg.rating || 0,
      reviewCount: aggs._count.rating || 0,
    },
  });

  revalidatePath(`/rooms/${booking.listingId}`);
  revalidatePath('/dashboard');
  redirect(`/rooms/${booking.listingId}`);
}

export async function replyToReview(reviewId: string, response: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: { listing: true },
  });

  if (!review) throw new Error('Review not found');

  if (review.listing.hostId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  await db.review.update({
    where: { id: reviewId },
    data: { response },
  });

  revalidatePath(`/rooms/${review.listingId}`);
}
