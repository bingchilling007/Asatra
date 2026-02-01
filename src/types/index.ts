import { UserRole, PropertyType, Province } from '@prisma/client';

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
  createdAt: Date;
};

// Re-export Prisma enums for frontend use
export { UserRole, PropertyType, Province };

// Helper types
export const PROVINCES_MAP: Record<Province, string> = {
  PUNJAB: 'Punjab',
  SINDH: 'Sindh',
  KPK: 'Khyber Pakhtunkhwa',
  BALOCHISTAN: 'Balochistan',
  GILGIT_BALTISTAN: 'Gilgit-Baltistan',
  AJK: 'Azad Kashmir',
  ICT: 'Islamabad Capital Territory',
  ISLAMABAD: 'Islamabad',
  AZAD_KASHMIR: 'Azad Jammu & Kashmir',
};

// Amenities list for Pakistan context
export const AMENITIES_LIST = [
  { id: 'WIFI', label: 'WiFi' },
  { id: 'AC', label: 'Air Conditioning' },
  { id: 'HEATING', label: 'Heating' },
  { id: 'KITCHEN', label: 'Kitchen' },
  { id: 'TV', label: 'TV' },
  { id: 'PARKING', label: 'Free Parking' },
  { id: 'GENERATOR', label: 'Generator Backup' }, // Critical for Pakistan
  { id: 'UPS', label: 'UPS Backup' },
  { id: 'GEYSER', label: 'Inst. Geyser' },
  { id: 'IRON', label: 'Iron' },
  { id: 'PRAYER_MAT', label: 'Prayer Mat' },
  { id: 'QIBLA_DIR', label: 'Qibla Direction' },
];

// Bank List
export const BANKS_LIST = [
  'HBL',
  'Meezan Bank',
  'Bank Alfalah',
  'UBL',
  'Standard Chartered',
  'JazzCash',
  'EasyPaisa',
  'SadaPay',
  'Nayapay',
];
