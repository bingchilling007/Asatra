'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole, PropertyType, Province } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { uploadFile } from '@/lib/upload';
import { z } from 'zod';

// Zod schemas for validation
const profileSchema = z.object({
  bio: z.string().min(10),
  bankName: z.string().min(3),
  accountNumber: z.string().min(5),
});

const listingSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  propertyType: z.nativeEnum(PropertyType),
  province: z.nativeEnum(Province),
  city: z.string().min(2),
  address: z.string().min(5),
  pricePerNight: z.coerce.number().min(100),
  maxGuests: z.coerce.number().min(1),
  bedrooms: z.coerce.number().min(0),
  beds: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  amenities: z.array(z.string()),
});

// ... imports

export async function createHostProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const rawData = {
    bio: formData.get('bio'),
    bankName: formData.get('bankName'),
    accountNumber: formData.get('accountNumber'),
  };

  const validated = profileSchema.safeParse(rawData);

  if (!validated.success) {
    const errorMessage = validated.error.errors[0].message;
    redirect(`/become-host?error=${encodeURIComponent(errorMessage)}`);
  }

  // Verify user exists (handling stale sessions after DB reset)
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
      redirect('/login?error=Session expired. Please log in again.');
  }

  // Upgrade user to HOST
  await db.user.update({
    where: { id: session.user.id },
    data: {
      role: UserRole.HOST,
      hostProfile: {
        create: {
          bio: validated.data.bio,
          bankName: validated.data.bankName,
          accountNumber: validated.data.accountNumber,
        },
      },
    },
  });

  revalidatePath('/dashboard');
  redirect('/host');
}

export async function createListing(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  // Handle amenities (checkboxes)
  const amenities = formData.getAll('amenities') as string[];

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    propertyType: formData.get('propertyType'),
    province: formData.get('province'),
    city: formData.get('city'),
    address: formData.get('address'),
    pricePerNight: formData.get('pricePerNight'),
    maxGuests: formData.get('maxGuests'),
    bedrooms: formData.get('bedrooms'),
    beds: formData.get('beds'),
    bathrooms: formData.get('bathrooms'),
    amenities,
  };

  const validated = listingSchema.safeParse(rawData);

  if (!validated.success) {
      const errorMessage = validated.error.errors[0].message;
       // Assuming this is termed 'create' or similar. 
       // Since I don't know the exact URL for listing creation (likely /host/create or /become-host/listing), 
       // I'll redirect to /host with error for now, as that is safer than crashing.
       // Although typically this would be a client component form.
      redirect(`/host?error=${encodeURIComponent('Listing validation failed: ' + errorMessage)}`);
  }

  // Handle Images
  const file = formData.get('image') as File;
  let imageUrl = '';
  
  if (file && file.size > 0) {
    imageUrl = await uploadFile(file);
  }

  // Create Listing
  await db.listing.create({
    data: {
      ...validated.data,
      hostId: session.user.id,
      images: imageUrl ? {
        create: { url: imageUrl }
      } : undefined,
    },
  });

  revalidatePath('/host');
  redirect('/host');
}
