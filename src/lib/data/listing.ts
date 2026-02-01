import { db } from '@/lib/db';
import { PropertyType, Prisma } from '@prisma/client';

export type SearchParams = {
  city?: string;
  min?: string;
  max?: string;
  type?: string;
  sort?: string;
  page?: string;
};

const ITEMS_PER_PAGE = 12;

export async function getListings(params: SearchParams) {
  const page = Number(params.page) || 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build Filter
  const where: Prisma.ListingWhereInput = {
    isActive: true,
  };

  if (params.city) {
    where.city = {
      contains: params.city,
      mode: 'insensitive',
    };
  }

  if (params.type && Object.values(PropertyType).includes(params.type as PropertyType)) {
    where.propertyType = params.type as PropertyType;
  }

  if (params.min || params.max) {
    where.pricePerNight = {
      gte: params.min ? Number(params.min) : undefined,
      lte: params.max ? Number(params.max) : undefined,
    };
  }

  // Build Sort
  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };

  if (params.sort === 'price_asc') {
    orderBy = { pricePerNight: 'asc' };
  } else if (params.sort === 'price_desc') {
    orderBy = { pricePerNight: 'desc' };
  }
  // TODO: Add rating sort when reviews are populated

  // Execute Query
  const [listings, totalCount] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        images: true, // Optimally restrict select fields, but include images for card
      },
    }),
    db.listing.count({ where }),
  ]);

  return {
    listings,
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    currentPage: page,
  };
}

export async function getListingById(id: string) {
  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      images: true,
      host: {
        include: {
          hostProfile: true, // For responses rate/time
        },
      },
      reviews: {
        include: {
          author: {
             select: { name: true, avatarUrl: true, createdAt: true }
             // Actually schema has 'avatarUrl'. 
          }
        },
        take: 5,
      },
      bookings: {
        where: {
          OR: [{ status: 'CONFIRMED' }, { status: 'PENDING' }],
          checkOut: { gte: new Date() },
        },
        select: { checkIn: true, checkOut: true },
      },
    },
  });
  return listing;
}
