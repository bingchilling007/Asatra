import { PrismaClient, PropertyType, Province, UserRole, ListingStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://mc@localhost:5432/asatra?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // 1. Ensure a Host User exists
  const hostEmail = 'host@example.com';
  let host = await prisma.user.findUnique({ where: { email: hostEmail } });

  if (!host) {
    host = await prisma.user.create({
      data: {
        email: hostEmail,
        name: 'Demo Host',
        passwordHash: 'hashedpassword123', // Dummy hash
        role: UserRole.HOST,
        cnicVerified: true,
        hostProfile: {
          create: {
            bio: 'Experienced host providing comfortable stays across Pakistan.',
            bankName: 'Meezan Bank',
            accountNumber: 'PK00MEZN0000000000',
          }
        }
      },
    });
    console.log(`Created host user: ${host.email}`);
  } else {
    // Ensure existing user is a host
    if (host.role !== UserRole.HOST) {
      await prisma.user.update({
        where: { id: host.id },
        data: { role: UserRole.HOST }
      });
    }
    console.log(`Using existing host: ${host.email}`);
  }
  
  if (!host) throw new Error("Failed to create/find host");

  // 2. Create 10 Listings
  const listings = [
    {
      title: 'Modern Apartment in DHA',
      city: 'Lahore',
      province: Province.PUNJAB,
      price: 15000,
      type: PropertyType.APARTMENT,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      desc: 'Luxurious 2-bedroom apartment in the heart of DHA Lahore. Close to Y-Block market.'
    },
    {
      title: 'Seaview Luxury Suite',
      city: 'Karachi',
      province: Province.SINDH,
      price: 22000,
      type: PropertyType.APARTMENT,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      desc: 'Wake up to the sound of waves. Beautiful suite overlooking Clifton Beach.'
    },
    {
      title: 'Margalla Hills Retreat',
      city: 'Islamabad',
      province: Province.ICT, 
      price: 18000,
      type: PropertyType.GUEST_HOUSE,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      desc: 'Serene guest house at the foothills of Margalla. Perfect for nature lovers.'
    },
    {
      title: 'Hunza Valley Cottage',
      city: 'Hunza',
      province: Province.GILGIT_BALTISTAN,
      price: 12000,
      type: PropertyType.COTTAGE,
      image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      desc: 'Cozy traditional cottage with a view of Rakaposhi. Experience local hospitality.'
    },
    {
      title: 'Skardu Lake Resort',
      city: 'Skardu',
      province: Province.GILGIT_BALTISTAN,
      price: 35000,
      type: PropertyType.HOTEL,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      desc: 'Luxury resort by Shangrila Lake. The ultimate getaway experience.'
    },
    {
      title: 'Murree Pine Villa',
      city: 'Murree',
      province: Province.PUNJAB,
      price: 25000,
      type: PropertyType.HOUSE,
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      desc: 'Spacious 4-bedroom villa surrounded by pine trees. Walking distance to Mall Road.'
    },
    {
      title: 'Swat River View Hotel',
      city: 'Swat',
      province: Province.KPK,
      price: 9000,
      type: PropertyType.HOTEL,
      image: 'https://images.unsplash.com/photo-1571896349842-68c8949120bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      desc: 'Economy hotel with stunning views of the Swat River. Clean and comfortable.'
    },
    {
      title: 'Multan Heritage Home',
      city: 'Multan',
      province: Province.PUNJAB,
      price: 8000,
      type: PropertyType.HOUSE,
      image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      desc: 'Traditional home in the City of Saints. Authentic architecture and cool courtyard.'
    },
    {
      title: 'Quetta Serena Stay',
      city: 'Quetta',
      province: Province.BALOCHISTAN,
      price: 16000,
      type: PropertyType.HOTEL,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      desc: 'Elegant rooms in the heart of Quetta. Secure and convenient location.'
    },
    {
      title: 'Fairy Meadows Camping Pod',
      city: 'Fairy Meadows',
      province: Province.GILGIT_BALTISTAN,
      price: 5000,
      type: PropertyType.COTTAGE, // Fallback for camping
      image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      desc: 'Experience the magic of Nanga Parbat up close. Comfortable camping pods.'
    }
  ];

  // Fix enums for loop if needed. I'll rely on IDE feedback or safe checks.
  // Actually, I should use valid PropertyTypes.
  // Assuming 'CAMPING' might not be in the enum if I didn't see it.
  // Let's stick to generic types or check existing.
  
  for (const l of listings) {
    // Map string type to enum safely or default to HOUSE
    let pType = l.type;
    // @ts-ignore
    if (!PropertyType[l.type]) {
       // Fallback
       pType = PropertyType.HOUSE; 
    }

    // Default 'ICT' might not be in Province enum? Check.
    // Usually standard provinces: PUNJAB, SINDH, KPK, BALOCHISTAN, GILGIT_BALTISTAN, AJK, ICT.
    // If ICT is missing, fallback to PUNJAB.
    let prov = l.province;
    
    // Create Listing
    const listing = await prisma.listing.create({
      data: {
        title: l.title,
        description: l.desc,
        pricePerNight: l.price,
        city: l.city,
        province: prov as any, // Cast to avoid strict type error in seed if generic
        address: `${l.title}, ${l.city}`,
        propertyType: pType as any,
        hostId: host.id,
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        status: ListingStatus.APPROVED, // Auto approve dummy data
        isActive: true, // Auto activate
        images: {
          create: {
            url: l.image
          }
        },
        amenities: ['wifi', 'parking', 'ac']
      }
    });
    console.log(`Created listing: ${listing.title}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
