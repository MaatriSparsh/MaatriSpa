export interface Service {
  id: string;
  name: string;
  nameHindi: string;
  category: 'postpartum_mother' | 'newborn_baby' | 'consultation' | 'workshop';
  description: string;
  descriptionHindi: string;
  priceInr: number;
  discountedPrice: number;
  duration: number; // in minutes
  image: string;
  benefits: string[];
  benefitsHindi: string[];
  activeStatus: boolean;
  createdAt?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
  descriptionHindi: string;
  maxDiscountInr: number;
  minBookingValueInr: number;
  activeStatus: boolean;
}

export interface Practitioner {
  id: string;
  name: string;
  role: string;
  roleHindi: string;
  avatar: string;
  bio: string;
  bioHindi: string;
  rating: number;
  specialties: string[];
  specialtiesHindi: string[];
}

export interface BookingDetails {
  motherName: string;
  babyName?: string;
  babyAgeWeeks?: string;
  email: string;
  phone: string;
  notes?: string;
  deliveryType?: 'normal' | 'lscs' | 'none';
  deliveryDate?: string;
  city?: 'Raipur' | 'Bhilai' | 'Durg' | '';
  address?: string;
  pincode?: string;
  stitchCondition?: string;
  focusArea?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceAddress?: string;
}

export interface Booking {
  id: string; // matches bookingId
  bookingId: string; // duplicate for strict field adherence
  customerName: string; // matches userDetails.motherName 
  email: string;
  phone: string;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // Time slot
  serviceId: string;
  serviceName: string;
  notes?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  bookingStatus: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  createdAt: string;
  
  // Reusable structured references for our wizard:
  service: Omit<Service, 'benefits' | 'benefitsHindi'>;
  practitioner: Practitioner;
  date: string;
  timeSlot: string;
  userDetails: BookingDetails;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  
  // INR Specific items: 
  originalPrice: number;
  priceInr: number;
  discountedPriceApplied: number;
  couponCodeApplied?: string;
  gstInr: number;
  finalPriceInr: number;
}

export interface Feedback {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  serviceName: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface PriceHistoryLog {
  id: string;
  serviceId: string;
  serviceName: string;
  previousPrice: number;
  newPrice: number;
  updatedBy: string;
  timestamp: string;
}

export interface Review {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  comment: string;
  commentHindi?: string; // optional localized comment
  serviceName?: string; // optional postnatal service details
  childName?: string; // optional details (e.g. child name, age, etc.)
  mediaUrl?: string; // secure media download URL
  mediaType?: 'image' | 'video' | 'none';
  status: 'Pending' | 'Approved' | 'Rejected';
  isFeatured: boolean;
  createdAt: string;
}

export type InfantMoodType = 'Happy & Content' | 'Playful & Alert' | 'Sleepy & Peaceful' | 'Fussy & Gassy' | 'Colicky & Crying';
export type SleepQualityType = 'Restful' | 'Fair' | 'Fragmented' | 'Exhausted';
export type LactationComfortType = 'Pain-Free & Smooth' | 'Comfortable' | 'Mild Engorgement' | 'Tender & Sore';

export interface WellnessMilestone {
  id: string; // e.g. "wm_2026-10-09" or UUID
  userId: string;
  date: string; // YYYY-MM-DD
  sleepHours: number; // e.g., 2 - 14
  sleepQuality: SleepQualityType;
  lactationSessions: number; // e.g., 0 - 16
  lactationComfort: LactationComfortType;
  infantMood: InfantMoodType;
  infantMoodScore: number; // 1 to 5 numeric for charts
  maternalVitality: number; // 1 to 5 scale
  waterGlasses: number; // 4 to 15
  specialMilestones?: string[];
  healingNotes?: string;
  createdAt: string;
}

