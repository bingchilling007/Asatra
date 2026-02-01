'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { ListingStatus, DisputeStatus, DisputeReason } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Approve a listing
 */
export async function approveListing(listingId: string) {
  const session = await auth();
  requireRole(session?.user?.role, 'ADMIN');

  await db.listing.update({
    where: { id: listingId },
    data: {
      status: ListingStatus.APPROVED,
      isActive: true, // Auto-activate on approval
      adminNotes: null, // Clear any rejection notes
    },
  });

  revalidatePath('/admin');
  revalidatePath(`/rooms/${listingId}`);
}

/**
 * Reject a listing
 */
export async function rejectListing(listingId: string, reason: string) {
  const session = await auth();
  requireRole(session?.user?.role, 'ADMIN');

  await db.listing.update({
    where: { id: listingId },
    data: {
      status: ListingStatus.REJECTED,
      isActive: false,
      adminNotes: reason,
    },
  });

  revalidatePath('/admin');
}

/**
 * Suspend a user
 */
export async function suspendUser(userId: string) {
  const session = await auth();
  requireRole(session?.user?.role, 'ADMIN');

  // Prevent self-suspension
  if (userId === session?.user?.id) {
    throw new Error('You cannot suspend yourself');
  }

  await db.user.update({
    where: { id: userId },
    data: { suspended: true },
  });

  // Optionally cancel their upcoming bookings or listings?
  // For MVP, just marking suspended. Authenticated actions should check this flag.

  revalidatePath('/admin');
}

/**
 * Reactivate a user
 */
export async function reactivateUser(userId: string) {
  const session = await auth();
  requireRole(session?.user?.role, 'ADMIN');

  await db.user.update({
    where: { id: userId },
    data: { suspended: false },
  });

  revalidatePath('/admin');
}

/**
 * Resolve a dispute
 */
export async function resolveDispute(disputeId: string, resolution: string, status: DisputeStatus) {
  const session = await auth();
  requireRole(session?.user?.role, 'ADMIN');

  await db.dispute.update({
    where: { id: disputeId },
    data: {
      resolution,
      status,
    },
  });

  revalidatePath('/admin');
}

/**
 * Create a dispute (User action, not admin, but included here or similar)
 * Actually, should be in user actions, but for 'moderation tools' context, 
 * we might need a way for admins to create tickets too? 
 * Stick to user creating it for now, implemented potentially elsewhere. 
 * But checking task list... "Implement createDispute". 
 * Implementing basic version here suitable for users.
 */
export async function createDispute(bookingId: string, category: DisputeReason, description: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  // Input validation
  if (!bookingId || typeof bookingId !== 'string') throw new Error('Invalid booking ID');
  if (!description || description.length < 10) throw new Error('Description must be at least 10 characters');
  if (!Object.values(DisputeReason).includes(category)) throw new Error('Invalid dispute category');

  // Verify booking belongs to user
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Check if user is Guest OR Host
  const isGuest = booking.guestId === session.user.id;
  const isHost = booking.listing.hostId === session.user.id;

  if (!isGuest && !isHost) {
    throw new Error('You are not authorized to dispute this booking');
  }
  
  const existing = await db.dispute.findUnique({ where: { bookingId }});
  if (existing) throw new Error('Dispute already exists for this booking');

  await db.dispute.create({
    data: {
        bookingId,
        openedById: session.user.id,
        category,
        description,
        status: DisputeStatus.OPEN,
    }
  });
  
  revalidatePath('/dashboard');
  revalidatePath('/admin');
}
