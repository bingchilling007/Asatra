import { PrismaClient, PropertyType, Province, UserRole, ListingStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://mc@localhost:5432/asatra?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // 1. Ensure a Host User exists
  const hostEmail = 'host@asatra.com';
  const hostPasswordHash = await bcrypt.hash('password123', 10);

  let host = await prisma.user.findUnique({ where: { email: hostEmail } });

  if (!host) {
    host = await prisma.user.create({
      data: {
        email: hostEmail,
        name: 'Asatra Demo Host',
        passwordHash: hostPasswordHash,
        role: UserRole.HOST,
        cnicVerified: true,
        hostProfile: {
          create: {
            bio: 'Experienced host with premium properties across Pakistan. Rated Superhost for 3 consecutive years.',
            bankName: 'Meezan Bank',
            accountNumber: 'PK00MEZN0000000012345',
            isSuperhost: true,
            rating: 4.8,
            totalReviews: 127,
          }
        }
      },
    });
    console.log(`Created host user: ${host.email}`);
  } else {
    console.log(`Using existing host: ${host.email}`);
  }

  if (!host) throw new Error('Failed to create/find host');

  // 2. Create 18 diverse listings
  const listings = [
    // ── Lahore ──────────────────────────────────────────
    {
      title: 'Modern Apartment in DHA Phase 6',
      city: 'Lahore',
      province: Province.PUNJAB,
      price: 15000,
      type: PropertyType.APARTMENT,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Luxurious 2-bedroom apartment in the heart of DHA Lahore. Walking distance to Y-Block market and premier dining.',
      maxGuests: 4, bedrooms: 2, beds: 3, bathrooms: 2,
      amenities: ['wifi', 'ac', 'parking', 'kitchen', 'washer', 'tv'],
      avgRating: 4.7, reviewCount: 23,
    },
    {
      title: 'Gulberg Luxury Penthouse',
      city: 'Lahore',
      province: Province.PUNJAB,
      price: 32000,
      type: PropertyType.APARTMENT,
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Stunning penthouse with panoramic city views, rooftop terrace, and premium interiors. Located in the heart of Gulberg III.',
      maxGuests: 6, bedrooms: 3, beds: 4, bathrooms: 3,
      amenities: ['wifi', 'ac', 'parking', 'kitchen', 'washer', 'gym', 'pool', 'tv', 'workspace'],
      avgRating: 4.9, reviewCount: 41,
    },
    // ── Karachi ──────────────────────────────────────────
    {
      title: 'Clifton Seaview Luxury Suite',
      city: 'Karachi',
      province: Province.SINDH,
      price: 22000,
      type: PropertyType.APARTMENT,
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Wake up to the sound of waves. Beautiful suite overlooking Clifton Beach with modern amenities and private balcony.',
      maxGuests: 4, bedrooms: 2, beds: 2, bathrooms: 2,
      amenities: ['wifi', 'ac', 'parking', 'kitchen', 'tv', 'workspace'],
      avgRating: 4.6, reviewCount: 18,
    },
    {
      title: 'DHA Karachi Family Villa',
      city: 'Karachi',
      province: Province.SINDH,
      price: 28000,
      type: PropertyType.HOUSE,
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Spacious 4-bedroom family villa in the prestigious DHA. Fully equipped kitchen, garden, and indoor parking for 2 cars.',
      maxGuests: 10, bedrooms: 4, beds: 5, bathrooms: 4,
      amenities: ['wifi', 'ac', 'parking', 'kitchen', 'washer', 'tv', 'pool', 'garden'],
      avgRating: 4.8, reviewCount: 35,
    },
    // ── Islamabad ──────────────────────────────────────────
    {
      title: 'Margalla Hills Serene Retreat',
      city: 'Islamabad',
      province: Province.ISLAMABAD,
      price: 18000,
      type: PropertyType.GUEST_HOUSE,
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Serene guest house at the foothills of Margalla Hills. Perfect for nature lovers and hikers, with a cozy fireplace.',
      maxGuests: 6, bedrooms: 3, beds: 3, bathrooms: 2,
      amenities: ['wifi', 'parking', 'kitchen', 'fireplace', 'garden', 'bbq'],
      avgRating: 4.9, reviewCount: 52,
    },
    {
      title: 'F-7 Executive Studio',
      city: 'Islamabad',
      province: Province.ISLAMABAD,
      price: 9500,
      type: PropertyType.ROOM,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Fully furnished executive studio in F-7, ideal for business travelers. High-speed internet, workspace desk, and proximity to Centaurus Mall.',
      maxGuests: 2, bedrooms: 1, beds: 1, bathrooms: 1,
      amenities: ['wifi', 'ac', 'tv', 'workspace', 'kitchen'],
      avgRating: 4.5, reviewCount: 14,
    },
    // ── Northern Pakistan ──────────────────────────────────────────
    {
      title: 'Hunza Valley Traditional Cottage',
      city: 'Hunza',
      province: Province.GILGIT_BALTISTAN,
      price: 12000,
      type: PropertyType.COTTAGE,
      images: [
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Cozy traditional stone cottage with breathtaking view of Rakaposhi. Experience authentic Hunzai hospitality with home-cooked meals.',
      maxGuests: 5, bedrooms: 2, beds: 3, bathrooms: 1,
      amenities: ['wifi', 'kitchen', 'garden', 'mountain_view', 'heating'],
      avgRating: 5.0, reviewCount: 67,
    },
    {
      title: 'Skardu Shangrila Lake Resort',
      city: 'Skardu',
      province: Province.GILGIT_BALTISTAN,
      price: 35000,
      type: PropertyType.HOTEL,
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Luxury resort by Shangrila Lake with stunning views of snowcapped peaks. Includes breakfast, a private boat, and guided treks.',
      maxGuests: 3, bedrooms: 1, beds: 2, bathrooms: 1,
      amenities: ['wifi', 'ac', 'breakfast', 'pool', 'tv', 'lake_view', 'guided_tours'],
      avgRating: 4.8, reviewCount: 89,
    },
    {
      title: 'Fairy Meadows Mountain Pod',
      city: 'Fairy Meadows',
      province: Province.GILGIT_BALTISTAN,
      price: 5500,
      type: PropertyType.COTTAGE,
      images: [
        'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Experience the magic of Nanga Parbat up close. Comfortable wooden pods with sleeping bags, kerosene heaters, and stunning mountain views.',
      maxGuests: 3, bedrooms: 1, beds: 2, bathrooms: 1,
      amenities: ['heating', 'mountain_view', 'guided_tours', 'meals_included'],
      avgRating: 4.7, reviewCount: 44,
    },
    {
      title: 'Nathiagali Hilltop Bungalow',
      city: 'Nathiagali',
      province: Province.KPK,
      price: 20000,
      type: PropertyType.HOUSE,
      images: [
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Classic British-era bungalow atop Nathiagali Hill. Fireplace, wraparound veranda, lush forest trails right at your doorstep.',
      maxGuests: 8, bedrooms: 4, beds: 5, bathrooms: 3,
      amenities: ['wifi', 'parking', 'kitchen', 'fireplace', 'garden', 'bbq', 'heating'],
      avgRating: 4.9, reviewCount: 31,
    },
    // ── Murree ──────────────────────────────────────────
    {
      title: 'Murree Pine Forest Villa',
      city: 'Murree',
      province: Province.PUNJAB,
      price: 25000,
      type: PropertyType.HOUSE,
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Spacious 4-bedroom villa surrounded by centuries-old pine trees. Walking distance to Mall Road. Perfect for family winter getaways.',
      maxGuests: 10, bedrooms: 4, beds: 6, bathrooms: 3,
      amenities: ['wifi', 'parking', 'kitchen', 'fireplace', 'tv', 'heating', 'bbq'],
      avgRating: 4.6, reviewCount: 28,
    },
    // ── Swat ──────────────────────────────────────────
    {
      title: 'Swat River View Guest House',
      city: 'Swat',
      province: Province.KPK,
      price: 9000,
      type: PropertyType.GUEST_HOUSE,
      images: [
        'https://images.unsplash.com/photo-1571896349842-68c8949120bb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Charming guesthouse with breathtaking views of the Swat River. Clean, comfortable rooms with home-cooked breakfast included.',
      maxGuests: 4, bedrooms: 2, beds: 2, bathrooms: 2,
      amenities: ['wifi', 'parking', 'breakfast', 'garden', 'river_view'],
      avgRating: 4.5, reviewCount: 19,
    },
    // ── Multan ──────────────────────────────────────────
    {
      title: 'Multan Heritage Haveli',
      city: 'Multan',
      province: Province.PUNJAB,
      price: 8000,
      type: PropertyType.GUEST_HOUSE,
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Restored traditional haveli in the City of Saints. Stunning Mughal-era architecture, cool courtyard, and rooftop terrace with city views.',
      maxGuests: 6, bedrooms: 3, beds: 3, bathrooms: 2,
      amenities: ['wifi', 'ac', 'parking', 'kitchen', 'rooftop', 'courtyard'],
      avgRating: 4.7, reviewCount: 22,
    },
    // ── Quetta ──────────────────────────────────────────
    {
      title: 'Quetta Serena Boutique Hotel',
      city: 'Quetta',
      province: Province.BALOCHISTAN,
      price: 16000,
      type: PropertyType.HOTEL,
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Elegant, secure boutique hotel in central Quetta. Modern rooms, restaurant on-site, and easy access to Hanna Lake and Ziarat.',
      maxGuests: 3, bedrooms: 1, beds: 2, bathrooms: 1,
      amenities: ['wifi', 'ac', 'parking', 'breakfast', 'tv', 'restaurant'],
      avgRating: 4.4, reviewCount: 16,
    },
    // ── Peshawar ──────────────────────────────────────────
    {
      title: 'Peshawar Old City Haveli',
      city: 'Peshawar',
      province: Province.KPK,
      price: 11000,
      type: PropertyType.GUEST_HOUSE,
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Authentic haveli experience in the heart of old Peshawar. Steps from the famous Qissa Khwani Bazaar with traditional architecture.',
      maxGuests: 5, bedrooms: 2, beds: 3, bathrooms: 2,
      amenities: ['wifi', 'ac', 'parking', 'kitchen', 'courtyard', 'rooftop'],
      avgRating: 4.6, reviewCount: 33,
    },
    // ── Rawalpindi ──────────────────────────────────────────
    {
      title: 'Rawalpindi Corporate Apartment',
      city: 'Rawalpindi',
      province: Province.PUNJAB,
      price: 7500,
      type: PropertyType.APARTMENT,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Well-furnished corporate apartment near Saddar. High-speed WiFi, 24/7 electricity backup, and close to Islamabad airport.',
      maxGuests: 3, bedrooms: 1, beds: 1, bathrooms: 1,
      amenities: ['wifi', 'ac', 'parking', 'workspace', 'tv', 'backup_power'],
      avgRating: 4.3, reviewCount: 11,
    },
    // ── Faisalabad ──────────────────────────────────────────
    {
      title: 'Faisalabad Central Studio',
      city: 'Faisalabad',
      province: Province.PUNJAB,
      price: 5000,
      type: PropertyType.ROOM,
      images: [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Clean and cozy studio apartment in central Faisalabad. Ideal for solo travelers and business visitors to the textile city.',
      maxGuests: 2, bedrooms: 1, beds: 1, bathrooms: 1,
      amenities: ['wifi', 'ac', 'tv', 'kitchen'],
      avgRating: 4.2, reviewCount: 8,
    },
    // ── Gwadar ──────────────────────────────────────────
    {
      title: 'Gwadar Coastal Beach Hut',
      city: 'Gwadar',
      province: Province.BALOCHISTAN,
      price: 14000,
      type: PropertyType.BEACH_HUT,
      images: [
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80',
      ],
      desc: 'Exclusive beachfront hut on the pristine Arabian Sea. Sunsets, fresh seafood, private beach access, and a once-in-a-lifetime experience.',
      maxGuests: 6, bedrooms: 2, beds: 3, bathrooms: 1,
      amenities: ['parking', 'beach_access', 'bbq', 'seafood', 'ocean_view'],
      avgRating: 4.8, reviewCount: 29,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const l of listings) {
    const existing = await prisma.listing.findFirst({
      where: { title: l.title, hostId: host.id }
    });

    if (existing) {
      console.log(`⏭  Skipping (already exists): ${l.title}`);
      skipped++;
      continue;
    }

    const [primaryImage, ...extraImages] = l.images;

    await prisma.listing.create({
      data: {
        title: l.title,
        description: l.desc,
        pricePerNight: l.price,
        city: l.city,
        province: l.province,
        address: `${l.title}, ${l.city}, Pakistan`,
        propertyType: l.type,
        hostId: host.id,
        maxGuests: l.maxGuests,
        bedrooms: l.bedrooms,
        beds: l.beds,
        bathrooms: l.bathrooms,
        status: ListingStatus.APPROVED,
        isActive: true,
        avgRating: l.avgRating,
        reviewCount: l.reviewCount,
        amenities: l.amenities,
        images: {
          create: [
            { url: primaryImage, order: 0 },
            ...extraImages.map((url, idx) => ({ url, order: idx + 1 })),
          ]
        },
      }
    });

    console.log(`✅ Created: ${l.title} (${l.city})`);
    created++;
  }

  console.log(`\nSeeding complete! Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
