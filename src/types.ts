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

