// Shared TypeScript types for ASATRA
// These extend or simplify Prisma types for use in components

import type {
  User,
  Property,
  Booking,
  Review,
  PropertyImage,
  UserRole,
  PropertyType,
  Province,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';

// Re-export Prisma types for convenience
export type {
  User,
  Property,
  Booking,
  Review,
  PropertyImage,
  UserRole,
  PropertyType,
  Province,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
};

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// PROPERTY TYPES
// ============================================
export interface PropertyWithHost extends Property {
  host: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  images: PropertyImage[];
}

export interface PropertyWithDetails extends Property {
  host: Pick<User, 'id' | 'name' | 'avatarUrl' | 'cnicVerified'>;
  images: PropertyImage[];
  _count: {
    bookings: number;
    reviews: number;
  };
  averageRating?: number;
}

export interface PropertySearchParams {
  city?: string;
  province?: Province;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  familyOnly?: boolean;
  page?: number;
  pageSize?: number;
}

// ============================================
// BOOKING TYPES
// ============================================
export interface BookingWithDetails extends Booking {
  property: PropertyWithHost;
  guest: Pick<User, 'id' | 'name' | 'avatarUrl' | 'phone'>;
}

export interface CreateBookingInput {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  guestMessage?: string;
}

export interface BookingPriceBreakdown {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalAmount: number;
}

// ============================================
// USER TYPES
// ============================================
export interface UserProfile extends Pick<User, 'id' | 'name' | 'email' | 'phone' | 'avatarUrl' | 'role' | 'cnicVerified' | 'createdAt'> {
  propertiesCount?: number;
  bookingsCount?: number;
  averageRating?: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

// ============================================
// FORM TYPES
// ============================================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  province: Province;
  pricePerNight: number;
  cleaningFee: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  houseRules?: string;
  familyOnly: boolean;
}

// ============================================
// CONSTANTS
// ============================================
export const PROVINCES: Record<Province, string> = {
  PUNJAB: 'Punjab',
  SINDH: 'Sindh',
  KPK: 'Khyber Pakhtunkhwa',
  BALOCHISTAN: 'Balochistan',
  GILGIT_BALTISTAN: 'Gilgit-Baltistan',
  AJK: 'Azad Jammu & Kashmir',
  ICT: 'Islamabad Capital Territory',
};

export const PROPERTY_TYPES: Record<PropertyType, string> = {
  HOUSE: 'House',
  APARTMENT: 'Apartment',
  GUEST_HOUSE: 'Guest House',
  FARMHOUSE: 'Farmhouse',
  ROOM: 'Private Room',
  COTTAGE: 'Cottage',
  BEACH_HUT: 'Beach Hut',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending Approval',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  JAZZCASH: 'JazzCash',
  EASYPAISA: 'Easypaisa',
  BANK_TRANSFER: 'Bank Transfer',
  CASH_ON_ARRIVAL: 'Cash on Arrival',
};

export const AMENITIES = {
  WIFI: 'Wi-Fi',
  AC: 'Air Conditioning',
  HEATING: 'Heating',
  KITCHEN: 'Kitchen',
  PARKING: 'Free Parking',
  TV: 'TV',
  WASHER: 'Washing Machine',
  POOL: 'Swimming Pool',
  GYM: 'Gym',
  GARDEN: 'Garden',
  BBQ: 'BBQ Grill',
  PRAYER_ROOM: 'Prayer Room',
  HALAL_KITCHEN: 'Halal Kitchen',
  GENERATOR: 'Generator Backup',
  SECURITY: '24/7 Security',
  MOUNTAIN_VIEW: 'Mountain View',
  LAKE_VIEW: 'Lake View',
} as const;

export type AmenityCode = keyof typeof AMENITIES;
