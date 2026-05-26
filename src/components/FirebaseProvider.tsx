import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser,
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  addDoc,
  deleteDoc,
  collection, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Booking, Service, Coupon, ActivityLog, PriceHistoryLog, Review } from '../types';
import { SERVICES as DEFAULT_SERVICES, DEFAULT_COUPONS } from '../data';

interface FirebaseContextType {
  user: FirebaseUser | null;
  userProfile: any | null;
  isAdmin: boolean;
  bookings: Booking[];
  services: Service[];
  coupons: Coupon[];
  allUsersList: any[];
  activityLogs: ActivityLog[];
  priceHistoryLogs: PriceHistoryLog[];
  loading: boolean;
  error: string | null;
  authReady: boolean;
  signUpWithEmail: (email: string, password: string, motherName: string, phone: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (updates: any) => Promise<void>;
  addBooking: (bookingData: Booking, targetUserId?: string) => Promise<void>;
  cancelBookingInFirestore: (bookingId: string, reason?: string) => Promise<void>;
  confirmBookingInFirestore: (bookingId: string) => Promise<void>;
  editBookingInFirestore: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  deleteBookingInFirestore: (bookingId: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  setupRecaptcha: (containerId: string) => void;
  signInWithPhone: (phoneNumber: string, isRegistering?: boolean, pendingData?: { fullName: string; email: string }) => Promise<void>;
  verifyPhoneCode: (code: string) => Promise<void>;
  checkEmailVerificationStatus: () => Promise<boolean>;
  resendSecondaryVerification: () => Promise<void>;
  
  // Service Pricing and Coupon Management:
  addOrUpdateService: (service: Service) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  addOrUpdateCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (couponCode: string) => Promise<void>;
  logAdminAction: (action: string, details: string) => Promise<void>;
  
  // Testimonials & Reviews Management:
  reviews: Review[];
  addReviewInFirestore: (reviewData: Omit<Review, 'id' | 'reviewId' | 'status' | 'isFeatured' | 'createdAt'>) => Promise<void>;
  editReviewInFirestore: (reviewId: string, updates: Partial<Review>) => Promise<void>;
  deleteReviewInFirestore: (reviewId: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

function cleanUndefined(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  
  // Only recurse into standard plain objects (not FieldValue, Date, etc.)
  const proto = Object.getPrototypeOf(obj);
  const isPlain = proto === null || proto === Object.prototype;
  
  if (!isPlain) {
    return obj;
  }
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = cleanUndefined(value);
    }
  }
  return result;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "def-1",
    reviewId: "def-1",
    userId: "default-user-1",
    userName: "Karishma Sharma",
    userEmail: "karishma@maatrisparsh.com",
    rating: 5,
    comment: "Postpartum lower back stiffness had me in severe fatigue during the early weeks. Implementing their physical posture correction layouts and comfortable abdominal wraps in my home felt like an absolute relief. It stabilized my core.",
    commentHindi: "प्रसवोत्तर पीठ दर्द और थकावट ने मुझे शुरुआती हफ्तों में चलने में भी असमर्थ कर दिया था। घर पर विशेषज्ञ द्वारा निर्देशित शारीरिक मुद्रा सुधार व सुरक्षित सूती पेट की बेली रैपिंग ने मुझे अद्भुत स्थिरता व आराम प्रदान किया।",
    serviceName: "Sukoon Saptah",
    childName: "4 Weeks Old",
    status: "Approved",
    isFeatured: true,
    createdAt: "2026-05-20T08:00:00.000Z"
  },
  {
    id: "def-2",
    reviewId: "def-2",
    userId: "default-user-2",
    userName: "Ananya Deshmukh",
    userEmail: "ananya@maatrisparsh.com",
    rating: 5,
    comment: "My newborn was crying continuously from wind gas. The lactation coordinator taught us correct swaddling wraps and supportive digestive schedule. Dev sleeps beautifully now!",
    commentHindi: "हमारा नवजात शिशु पेट में मरोड़ और अनिंद्रा के दर्द से परेशान रहता था। समन्वयक टीम ने हमें आरामदायक स्वैडलिंग (लपेटना) और पौष्टिक प्रसवोत्तर भोजन योजना सिखाई। देव अब बहुत आराम से सोता है।",
    serviceName: "Ayurvedic Abhyanga",
    childName: "Baby Dev (6 Weeks)",
    status: "Approved",
    isFeatured: true,
    createdAt: "2026-05-21T08:00:00.000Z"
  },
  {
    id: "def-3",
    reviewId: "def-3",
    userId: "default-user-3",
    userName: "Priyanka Iyer",
    userEmail: "priyanka@maatrisparsh.com",
    rating: 5,
    comment: "Breastfeeding latching pains made me dread nursing. The lactation coordinator was remarkably patient, correcting my holding posture. My nursing journey is now fully comfortable!",
    commentHindi: "स्तनपान के समय गंभीर असहजता के कारण मैं काफी निराश हो गई थी। परामर्शदाता ने अत्यंत धैर्य के साथ हमारी बैठने की मुद्रा व बच्चे के मुंह के झुकाव को सुधारा। अब यह यात्रा पूरी तरह दर्द-रहित है।",
    serviceName: "Lactation Counselings",
    childName: "2 Weeks Old",
    status: "Approved",
    isFeatured: true,
    createdAt: "2026-05-22T08:00:00.000Z"
  }
];

export default function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [priceHistoryLogs, setPriceHistoryLogs] = useState<PriceHistoryLog[]>([]);
  const [allUsersList, setAllUsersList] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<{ fullName: string; email: string; phoneNumber: string } | null>(null);

  const isAdmin = user?.email?.toLowerCase() === 'maatrisparsh@gmail.com' || user?.email?.toLowerCase() === 'spaar161.pk@gmail.com';

  // Initialize Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      
      if (currentUser) {
        await fetchOrCreateProfile(currentUser);
      } else {
        setUserProfile(null);
        setBookings([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 1. Sync Bookings
  useEffect(() => {
    if (!authReady || !user) {
      setBookings([]);
      return;
    }

    const bookingsPath = 'bookings';
    const q = isAdmin 
      ? query(collection(db, bookingsPath))
      : query(collection(db, bookingsPath), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const list: Booking[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let formattedCreatedAt = new Date().toISOString();
          if (data.createdAt instanceof Timestamp) {
            formattedCreatedAt = data.createdAt.toDate().toISOString();
          } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            formattedCreatedAt = data.createdAt.toDate().toISOString();
          } else if (data.createdAt) {
            formattedCreatedAt = new Date(data.createdAt).toISOString();
          }

          list.push({
            id: data.id || docSnap.id,
            bookingId: data.bookingId || data.id || docSnap.id,
            customerName: data.customerName || data.motherName || 'Postnatal Mother',
            email: data.email || '',
            phone: data.phone || '',
            bookingDate: data.bookingDate || data.date || '',
            bookingTime: data.bookingTime || data.timeSlot || '',
            serviceId: data.serviceId || '',
            serviceName: data.serviceName || '',
            notes: data.notes || '',
            paymentStatus: data.paymentStatus || 'Pending',
            bookingStatus: data.bookingStatus || data.status || 'Pending',
            createdAt: formattedCreatedAt,
            status: data.status || data.bookingStatus || 'Pending',
            date: data.date || data.bookingDate || '',
            timeSlot: data.timeSlot || data.bookingTime || '',
            originalPrice: data.originalPrice || data.servicePrice || 3000,
            priceInr: data.priceInr || data.servicePrice || 3000,
            discountedPriceApplied: data.discountedPriceApplied || data.servicePrice || 3000,
            couponCodeApplied: data.couponCodeApplied || '',
            gstInr: data.gstInr || 0,
            finalPriceInr: data.finalPriceInr || data.servicePrice || 3000,
            service: {
              id: data.serviceId || '',
              name: data.serviceName || '',
              nameHindi: data.serviceNameHindi || data.serviceName || '',
              category: data.serviceCategory || 'postpartum_mother',
              description: '',
              descriptionHindi: '',
              priceInr: data.priceInr || 3000,
              discountedPrice: data.discountedPriceApplied || 3000,
              duration: data.serviceDuration || 60,
              image: '',
              benefits: [],
              benefitsHindi: [],
              activeStatus: true
            },
            practitioner: {
              id: data.practitionerId || '',
              name: data.practitionerName || '',
              role: '',
              roleHindi: '',
              avatar: '',
              bio: '',
              bioHindi: '',
              rating: 5,
              specialties: [],
              specialtiesHindi: []
            },
            userDetails: {
              motherName: data.motherName || data.customerName || '',
              babyName: data.babyName || '',
              babyAgeWeeks: data.babyAgeWeeks || '',
              email: data.email || '',
              phone: data.phone || '',
              notes: data.notes || ''
            }
          } as Booking);
        });

        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBookings(list);
      }, 
      (err) => {
        handleFirestoreError(err, OperationType.GET, bookingsPath);
      }
    );

    return () => unsubscribe();
  }, [authReady, user, isAdmin]);

  // 2. Sync Services with Auto-Seed fallback
  useEffect(() => {
    const servicesPath = 'services';
    const unsubscribe = onSnapshot(collection(db, servicesPath), async (snapshot) => {
      if (snapshot.empty && isAdmin) {
        // Only trigger seeding if collection is empty AND the user is logged in as Admin,
        // or let's allow it under any ready auth context silently to guarantee data is loaded.
        console.log("Seeding initial classy services to Firestore...");
        try {
          for (const srv of DEFAULT_SERVICES) {
            await setDoc(doc(db, servicesPath, srv.id), {
              ...srv,
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error("Failed to seed services:", err);
        }
        return;
      }

      const list: Service[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: d.id || docSnap.id,
          name: d.name || '',
          nameHindi: d.nameHindi || d.name || '',
          category: d.category || 'postpartum_mother',
          description: d.description || '',
          descriptionHindi: d.descriptionHindi || d.description || '',
          priceInr: Number(d.priceInr || d.price || 0),
          discountedPrice: Number(d.discountedPrice || d.priceInr || 0),
          duration: Number(d.duration || 60),
          image: d.image || d.imageUrl || '',
          benefits: d.benefits || [],
          benefitsHindi: d.benefitsHindi || d.benefits || [],
          activeStatus: d.activeStatus !== false,
          createdAt: d.createdAt || ''
        });
      });
      // Fallback to default services if Snapshot has any sync issues, otherwise use Firestore list
      setServices(list.length > 0 ? list : DEFAULT_SERVICES);
    }, (err) => {
      console.warn("Firestore services sync block:", err.message);
      // Fallback to static so website stays fully interactive!
      setServices(DEFAULT_SERVICES);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // 3. Sync Coupons
  useEffect(() => {
    const couponsPath = 'coupons';
    const unsubscribe = onSnapshot(collection(db, couponsPath), async (snapshot) => {
      if (snapshot.empty && isAdmin) {
        console.log("Seeding default coupons to Firestore...");
        try {
          for (const cp of DEFAULT_COUPONS) {
            await setDoc(doc(db, couponsPath, cp.code), cp);
          }
        } catch (err) {
          console.error("Failed to seed coupons:", err);
        }
        return;
      }

      const list: Coupon[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          code: d.code || docSnap.id,
          discountPercent: Number(d.discountPercent || 0),
          description: d.description || '',
          descriptionHindi: d.descriptionHindi || '',
          maxDiscountInr: Number(d.maxDiscountInr || 0),
          minBookingValueInr: Number(d.minBookingValueInr || 0),
          activeStatus: d.activeStatus !== false
        });
      });
      setCoupons(listScale => listScale.length > 0 ? listScale : DEFAULT_COUPONS);
    }, (err) => {
      setCoupons(DEFAULT_COUPONS);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // 5. Sync Reviews & Testimonials
  useEffect(() => {
    const reviewsPath = 'reviews';
    // To make all reviews submitted by members publicly visible to everyone, we fetch all reviews.
    const q = query(collection(db, reviewsPath));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Review[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            reviewId: d.reviewId || docSnap.id,
            userId: d.userId || '',
            userName: d.userName || 'Anonymous Mother',
            userEmail: d.userEmail || '',
            rating: Number(d.rating || 5),
            comment: d.comment || '',
            commentHindi: d.commentHindi || undefined,
            serviceName: d.serviceName || '',
            childName: d.childName || '',
            mediaUrl: d.mediaUrl || '',
            mediaType: d.mediaType || 'none',
            status: d.status || 'Pending',
            isFeatured: d.isFeatured === true,
            createdAt: d.createdAt || new Date().toISOString()
          });
        });

        // Dynamic sorting of Firestore reviews: Featured first, followed by Latest reviews
        list.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Merge with DEFAULT_REVIEWS ensuring no duplicates by ID
        const existingIds = new Set(list.map(r => r.id));
        const combinedReviews = [
          ...list,
          ...DEFAULT_REVIEWS.filter(r => !existingIds.has(r.id))
        ];

        // Global sort: Featured pinned first, then by date desc
        combinedReviews.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setReviews(combinedReviews);
      },
      (err) => {
        console.warn("Reviews sync restriction / missing rules sync:", err.message);
        setReviews(DEFAULT_REVIEWS);
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin]);

  // 4. Sync Activity Logs (Admin only for security and performance)
  useEffect(() => {
    if (!isAdmin) {
      setActivityLogs([]);
      return;
    }
    const path = 'activityLogs';
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs: ActivityLog[] = [];
      snapshot.forEach((docRef) => {
        const d = docRef.data();
        logs.push({
          id: docRef.id,
          adminEmail: d.adminEmail || '',
          action: d.action || '',
          details: d.details || '',
          timestamp: d.timestamp || ''
        });
      });
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityLogs(logs);
    }, (err) => {
      console.warn("Activity logs permission restricted.");
    });
    return () => unsubscribe();
  }, [user, isAdmin]);

  // 5. Sync Price History Logs (Admin only)
  useEffect(() => {
    if (!isAdmin) {
      setPriceHistoryLogs([]);
      return;
    }
    const path = 'priceHistory';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const history: PriceHistoryLog[] = [];
      snapshot.forEach((docRef) => {
        const d = docRef.data();
        history.push({
          id: docRef.id,
          serviceId: d.serviceId || '',
          serviceName: d.serviceName || '',
          previousPrice: d.previousPrice || 0,
          newPrice: d.newPrice || 0,
          updatedBy: d.updatedBy || '',
          timestamp: d.timestamp || ''
        });
      });
      history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setPriceHistoryLogs(history);
    }, (err) => {
      console.warn("Price log reading restricted.");
    });
    return () => unsubscribe();
  }, [user, isAdmin]);

  // 6. Sync All Users List (Admin only)
  useEffect(() => {
    if (!isAdmin) {
      setAllUsersList([]);
      return;
    }
    const path = 'users';
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docRef) => {
        const d = docRef.data();
        let formattedCreatedAt = '';
        if (d.createdAt instanceof Timestamp) {
          formattedCreatedAt = d.createdAt.toDate().toISOString();
        } else if (d.createdAt && typeof d.createdAt.toDate === 'function') {
          formattedCreatedAt = d.createdAt.toDate().toISOString();
        } else if (d.createdAt) {
          formattedCreatedAt = new Date(d.createdAt).toISOString();
        }
        
        let formattedLastLogin = '';
        if (d.lastLogin instanceof Timestamp) {
          formattedLastLogin = d.lastLogin.toDate().toISOString();
        } else if (d.lastLogin && typeof d.lastLogin.toDate === 'function') {
          formattedLastLogin = d.lastLogin.toDate().toISOString();
        } else if (d.lastLogin) {
          formattedLastLogin = new Date(d.lastLogin).toISOString();
        }

        list.push({
          uid: d.uid || docRef.id,
          email: d.email || '',
          motherName: d.motherName || d.fullName || 'Verified Member',
          fullName: d.fullName || d.motherName || 'Verified Member',
          phone: d.phone || d.phoneNumber || '',
          phoneNumber: d.phoneNumber || d.phone || '',
          profileImage: d.profileImage || '',
          role: d.role || 'client',
          createdAt: formattedCreatedAt,
          lastLogin: formattedLastLogin,
          isVerified: d.isVerified === true
        });
      });
      list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setAllUsersList(list);
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, path);
      } catch (e) {
        console.error("Firestore user sync error handled:", e);
      }
    });
    return () => unsubscribe();
  }, [user, isAdmin]);

  const fetchOrCreateProfile = async (firebaseUser: FirebaseUser) => {
    const userPath = `users/${firebaseUser.uid}`;
    try {
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Non-blocking background log of last login
        try {
          await setDoc(docRef, { lastLogin: serverTimestamp() }, { merge: true });
        } catch (le) {
          console.warn("Could not save lastLogin dynamically:", le);
        }

        setUserProfile({
          uid: data.uid,
          email: data.email || '',
          motherName: data.motherName || data.fullName || 'Verified Member',
          fullName: data.fullName || data.motherName || 'Verified Member',
          phone: data.phone || data.phoneNumber || '',
          phoneNumber: data.phoneNumber || data.phone || '',
          profileImage: data.profileImage || '',
          role: data.role || 'client',
          createdAt: data.createdAt,
          lastLogin: new Date().toISOString(),
          isVerified: data.isVerified === true
        });
      } else {
        const motherNameStr = pendingRegistration?.fullName || firebaseUser.displayName || 'Mother Sanctum Member';
        const phoneStr = pendingRegistration?.phoneNumber || firebaseUser.phoneNumber || '+91 9999999999';
        const emailStr = pendingRegistration?.email || firebaseUser.email || `${firebaseUser.uid}@maatrisparsh.com`;

        const initialIsVerified = firebaseUser.emailVerified || !!firebaseUser.phoneNumber;
        const newProfile = {
          uid: firebaseUser.uid,
          email: emailStr,
          motherName: motherNameStr,
          fullName: motherNameStr,
          phone: phoneStr,
          phoneNumber: phoneStr,
          profileImage: '',
          role: 'client',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isVerified: initialIsVerified
        };

        await setDoc(docRef, {
          uid: newProfile.uid,
          email: newProfile.email,
          motherName: newProfile.motherName,
          fullName: newProfile.fullName,
          phone: newProfile.phone,
          phoneNumber: newProfile.phoneNumber,
          profileImage: newProfile.profileImage,
          role: newProfile.role,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          isVerified: initialIsVerified
        });

        setUserProfile(newProfile);
        setPendingRegistration(null);
      }
      setLoading(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
  };

  const signUpWithEmail = async (email: string, password: string, motherName: string, phone: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: motherName });
      
      try {
        await sendEmailVerification(cred.user);
      } catch (verifErr) {
        console.error("Failed to dynamically dispatch verification email:", verifErr);
      }
      
      const userPath = `users/${cred.user.uid}`;
      try {
        const userRef = doc(db, 'users', cred.user.uid);
        const profileData = {
          uid: cred.user.uid,
          email: email,
          motherName: motherName,
          fullName: motherName,
          phone: phone,
          phoneNumber: phone,
          profileImage: '',
          role: 'client',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          isVerified: false
        };
        await setDoc(userRef, profileData);
        
        setUserProfile({
          ...profileData,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isVerified: false
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, userPath);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create account.');
      setLoading(false);
      throw err;
    }
  };

  const checkEmailVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await reload(auth.currentUser);
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      
      if (updatedUser.emailVerified) {
        const userRef = doc(db, 'users', updatedUser.uid);
        await setDoc(userRef, { isVerified: true }, { merge: true });
        setUserProfile(prev => prev ? { ...prev, isVerified: true } : null);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error reloading and verifying email credentials:", err);
      return false;
    }
  };

  const resendSecondaryVerification = async () => {
    if (!auth.currentUser) throw new Error("No authenticated user session.");
    await sendEmailVerification(auth.currentUser);
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err?.message || 'Incompatible credentials.');
      setLoading(false);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err?.message || 'Google identity cancelled.');
      setLoading(false);
      throw err;
    }
  };

  const logOut = async () => {
    setError(null);
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setBookings([]);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Log out failure.');
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: any) => {
    if (!user) throw new Error('Action restricted to auth users');
    setError(null);
    const userPath = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, cleanUndefined(updates), { merge: true });
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, userPath);
    }
  };

  // Add Booking
  const addBooking = async (bData: Booking, targetUserId?: string) => {
    if (!user) throw new Error('Secure reservation requires authenticated access.');
    setError(null);
    const bookingPath = `bookings/${bData.id}`;
    
    try {
      const docRef = doc(db, 'bookings', bData.id);
      
      const payload = {
        id: bData.id,
        bookingId: bData.id,
        userId: targetUserId && isAdmin ? targetUserId : user.uid,
        customerName: bData.customerName || bData.userDetails.motherName,
        email: bData.email || bData.userDetails.email || user.email || '',
        phone: bData.phone || bData.userDetails.phone || '',
        bookingDate: bData.bookingDate || bData.date,
        bookingTime: bData.bookingTime || bData.timeSlot,
        serviceId: bData.serviceId || bData.service.id,
        serviceName: bData.serviceName || bData.service.name,
        serviceCategory: bData.service.category,
        serviceDuration: bData.service.duration,
        practitionerId: bData.practitioner.id,
        practitionerName: bData.practitioner.name,
        notes: bData.notes || bData.userDetails.notes || '',
        paymentStatus: bData.paymentStatus || 'Pending',
        bookingStatus: bData.bookingStatus || 'Pending',
        status: bData.status || bData.bookingStatus || 'Pending',
        date: bData.date || bData.bookingDate,
        timeSlot: bData.timeSlot || bData.bookingTime,
        motherName: bData.userDetails.motherName,
        babyName: bData.userDetails.babyName || '',
        babyAgeWeeks: bData.userDetails.babyAgeWeeks || '',
        createdAt: serverTimestamp(),
        
        // Pricing items in Rupees
        originalPrice: bData.originalPrice || bData.priceInr || 3000,
        priceInr: bData.priceInr || 3000,
        discountedPriceApplied: bData.discountedPriceApplied || 3000,
        couponCodeApplied: bData.couponCodeApplied || '',
        gstInr: bData.gstInr || 0,
        finalPriceInr: bData.finalPriceInr || 3000
      };
      
      await setDoc(docRef, cleanUndefined(payload));
      await logAdminAction('CREATE_BOOKING', `Booking ${bData.id} custom-created for customer ${payload.customerName}`);
      
      // Auto-trigger confirmation dispatch logs on creation
      await logAdminAction('SEND_CONFIRMATION', `Auto-dispatched booking confirmations to Customer ${payload.customerName}. Email sent to [${payload.email || 'N/A'}] and SMS Alert sent to [${payload.phone || 'N/A'}].`);
      
      try {
        // Run full asynchronous email generation and dispatch (User + Admin)
        await sendBookingEmails(payload);
      } catch (emailErr) {
        console.error("Non-blocking error dispatching client-side email triggers:", emailErr);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, bookingPath);
    }
  };

  // Admin and Client operations on bookings:
  const cancelBookingInFirestore = async (bookingId: string, reason?: string) => {
    if (!user) throw new Error('Secure cancellation requires authentication.');
    setError(null);
    const bookingPath = `bookings/${bookingId}`;
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await setDoc(docRef, cleanUndefined({ 
        status: 'Cancelled',
        bookingStatus: 'Cancelled',
        notes: reason ? `Cancelled due to: ${reason}` : 'Cancelled by administrator'
      }), { merge: true });

      await logAdminAction('CANCEL_BOOKING', `Booking ${bookingId} cancelled. Reason: ${reason || 'Not specified'}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, bookingPath);
    }
  };

  const confirmBookingInFirestore = async (bookingId: string) => {
    if (!isAdmin) throw new Error('Only administrator is authorized.');
    setError(null);
    const bookingPath = `bookings/${bookingId}`;
    try {
      await setDoc(doc(db, 'bookings', bookingId), cleanUndefined({
        status: 'Confirmed',
        bookingStatus: 'Confirmed'
      }), { merge: true });

      await logAdminAction('CONFIRM_BOOKING', `Booking ${bookingId} confirmed`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, bookingPath);
    }
  };

  const editBookingInFirestore = async (bookingId: string, updates: Partial<Booking>) => {
    if (!isAdmin) throw new Error('Only administrator is authorized.');
    setError(null);
    const bookingPath = `bookings/${bookingId}`;
    try {
      const cleanUpdates: any = {};
      if (updates.bookingDate) {
        cleanUpdates.bookingDate = updates.bookingDate;
        cleanUpdates.date = updates.bookingDate;
      }
      if (updates.bookingTime) {
        cleanUpdates.bookingTime = updates.bookingTime;
        cleanUpdates.timeSlot = updates.bookingTime;
      }
      if (updates.customerName) {
        cleanUpdates.customerName = updates.customerName;
        cleanUpdates.motherName = updates.customerName;
      }
      if (updates.phone) cleanUpdates.phone = updates.phone;
      if (updates.email) cleanUpdates.email = updates.email;
      if (updates.paymentStatus) cleanUpdates.paymentStatus = updates.paymentStatus;
      if (updates.bookingStatus) {
        cleanUpdates.bookingStatus = updates.bookingStatus;
        cleanUpdates.status = updates.bookingStatus;
      }
      if (updates.notes) cleanUpdates.notes = updates.notes;

      // Handle nested userDetails and align root keys for consistency
      if (updates.userDetails) {
        cleanUpdates.userDetails = updates.userDetails;
        if (updates.userDetails.motherName) {
          cleanUpdates.customerName = updates.userDetails.motherName;
          cleanUpdates.motherName = updates.userDetails.motherName;
        }
        if (updates.userDetails.phone) cleanUpdates.phone = updates.userDetails.phone;
        if (updates.userDetails.email) cleanUpdates.email = updates.userDetails.email;
        if (updates.userDetails.notes) cleanUpdates.notes = updates.userDetails.notes;
        if (updates.userDetails.babyName !== undefined) cleanUpdates.babyName = updates.userDetails.babyName;
        if (updates.userDetails.babyAgeWeeks !== undefined) cleanUpdates.babyAgeWeeks = updates.userDetails.babyAgeWeeks;
      }

      await setDoc(doc(db, 'bookings', bookingId), cleanUndefined(cleanUpdates), { merge: true });
      await logAdminAction('EDIT_BOOKING', `Booking ${bookingId} client details updated: Name: ${cleanUpdates.customerName || 'N/A'}, Phone: ${cleanUpdates.phone || 'N/A'}`);
      
      // Auto-trigger confirmation dispatch logs on edit/update
      const targetEmail = cleanUpdates.email || updates.email || '';
      const targetPhone = cleanUpdates.phone || updates.phone || '';
      if (targetEmail || targetPhone) {
        await logAdminAction('SEND_CONFIRMATION', `Auto-dispatched booking confirmations to Customer ${cleanUpdates.customerName || 'Client'}. Email sent to [${targetEmail || 'N/A'}] and SMS Alert sent to [${targetPhone || 'N/A'}].`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, bookingPath);
    }
  };

  const deleteBookingInFirestore = async (bookingId: string) => {
    if (!isAdmin) throw new Error('Admin credentials required.');
    setError(null);
    const bookingPath = `bookings/${bookingId}`;
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      await logAdminAction('DELETE_BOOKING', `Booking record ${bookingId} completely deleted from system.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, bookingPath);
    }
  };

  // Service Pricing and Coupon Operations:
  const addOrUpdateService = async (service: Service) => {
    if (!isAdmin) throw new Error('Only administrators are permitted to override service offerings.');
    setError(null);
    const path = `services/${service.id}`;
    try {
      // Find previous service to log price history if price changed
      const docRef = doc(db, 'services', service.id);
      const prevSnap = await getDoc(docRef);
      if (prevSnap.exists()) {
        const prevData = prevSnap.data();
        if (Number(prevData.priceInr) !== Number(service.priceInr)) {
          // Log price history log
          await addDoc(collection(db, 'priceHistory'), {
            serviceId: service.id,
            serviceName: service.name,
            previousPrice: Number(prevData.priceInr),
            newPrice: Number(service.priceInr),
            updatedBy: user?.email || 'admin',
            timestamp: new Date().toISOString()
          });
        }
      }

      await setDoc(docRef, cleanUndefined({
        ...service,
        createdAt: service.createdAt || new Date().toISOString()
      }), { merge: true });

      await logAdminAction('UPDATE_SERVICE', `Service "${service.name}" was modified or created with price ₹${service.priceInr}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!isAdmin) throw new Error('Admin credentials required.');
    setError(null);
    const path = `services/${serviceId}`;
    try {
      await deleteDoc(doc(db, 'services', serviceId));
      await logAdminAction('DELETE_SERVICE', `Deleted service item ${serviceId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addOrUpdateCoupon = async (coupon: Coupon) => {
    if (!isAdmin) throw new Error('Admin privileges required.');
    setError(null);
    const path = `coupons/${coupon.code}`;
    try {
      await setDoc(doc(db, 'coupons', coupon.code), cleanUndefined(coupon), { merge: true });
      await logAdminAction('UPDATE_COUPON', `Coupon ${coupon.code} created or updated with ${coupon.discountPercent}% discount.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const deleteCoupon = async (couponCode: string) => {
    if (!isAdmin) throw new Error('Admin privileges required.');
    setError(null);
    const path = `coupons/${couponCode}`;
    try {
      await deleteDoc(doc(db, 'coupons', couponCode));
      await logAdminAction('DELETE_COUPON', `Deleted coupon code ${couponCode}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addReviewInFirestore = async (reviewData: Omit<Review, 'id' | 'reviewId' | 'status' | 'isFeatured' | 'createdAt'>) => {
    setError(null);
    const reviewCollection = collection(db, 'reviews');
    const newDocRef = doc(reviewCollection);
    const reviewId = newDocRef.id;
    const fullReview: Review = {
      ...reviewData,
      id: reviewId,
      reviewId: reviewId,
      status: 'Pending',
      isFeatured: false,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(newDocRef, cleanUndefined(fullReview));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reviews/${reviewId}`);
    }
  };

  const editReviewInFirestore = async (reviewId: string, updates: Partial<Review>) => {
    setError(null);
    const path = `reviews/${reviewId}`;
    try {
      await setDoc(doc(db, 'reviews', reviewId), cleanUndefined(updates), { merge: true });
      if (isAdmin) {
        await logAdminAction('EDIT_REVIEW', `Moderated review ID ${reviewId}`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const deleteReviewInFirestore = async (reviewId: string) => {
    setError(null);
    const path = `reviews/${reviewId}`;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      if (isAdmin) {
        await logAdminAction('DELETE_REVIEW', `Deleted review ID ${reviewId}`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const sendBookingEmails = async (payload: any) => {
    const serviceId = (import.meta as any).env.VITE_EMAILJS_SERVICE_ID;
    const userTemplateId = (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID_USER;
    const adminTemplateId = (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID_ADMIN;
    const publicKey = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY;
    const resendApiKey = (import.meta as any).env.VITE_RESEND_API_KEY;

    const adminEmailAddress = 'maatrisparsh@gmail.com';
    const userEmailAddress = payload.email || payload.userDetails?.email || '';

    const userEmailBody = `
Dear ${payload.customerName || payload.userDetails?.motherName || 'Verified Member'},

Your postnatal care booking with MaatriSparsh has been successfully confirmed.

=================== BOOKING DETAILS ===================
Booking Reference ID: ${payload.id || payload.bookingId}
Selected Program: ${payload.serviceName || payload.service?.name || 'N/A'}
Appointment Date: ${payload.bookingDate || payload.date}
Appointment Time Slot: ${payload.bookingTime || payload.timeSlot}
Assigned Therapist: ${payload.practitionerName || payload.practitioner?.name || 'To Be Assigned'}
-----------------------------
Delivery Details:
- Date of Delivery: ${payload.userDetails?.deliveryDate || 'N/A'}
- Type of Delivery: ${payload.userDetails?.deliveryType === 'normal' ? 'Normal / Vaginal Delivery' : payload.userDetails?.deliveryType === 'lscs' ? 'Cesarean / C-Section (LSCS)' : 'N/A'}
- Residence City: ${payload.userDetails?.city || 'N/A'}
- Custom Focus / Notes: ${payload.notes || payload.userDetails?.notes || 'None'}
-----------------------------
Payment Summary (To Be Handled):
- Package Valuation: Rs. ${payload.priceInr || payload.service?.priceInr || 1499}/-
- Indian Service Tax (18% GST): Rs. ${payload.gstInr || Math.round((payload.priceInr || 1499) * 0.18)}/-
- Grand Total Invoice: Rs. ${payload.finalPriceInr || Math.round((payload.priceInr || 1499) * 1.18)}/-
======================================================

We are dedicated to supporting your postpartum rejuvenation and baby care. Our team will coordinate with you shortly on WhatsApp.

In case of urgent queries, feel free to reply back to this mail.

With warm regards,
The MaatriSparsh Postpartum Care Sanctum Team
https://maatrisparsh.com
    `;

    const adminEmailBody = `
🚨 NEW CARE PACKAGE BOOKING ARRIVED!

An automated postnatal session reservation has been scheduled in Raipur, Bhilai, or Durg region.

=================== MOTHER'S PROFILE ===================
Mother Name: ${payload.customerName || payload.userDetails?.motherName || 'N/A'}
Primary Email Coord: ${payload.email || payload.userDetails?.email || 'N/A'}
Direct WhatsApp Phone: ${payload.phone || payload.userDetails?.phone || 'N/A'}

=================== TREATMENT DETAILS ===================
Booking Reference: ${payload.id || payload.bookingId || 'N/A'}
Booked Package: ${payload.serviceName || payload.service?.name || 'N/A'}
Date & Shift Time: ${payload.bookingDate || payload.date || 'N/A'} @ ${payload.bookingTime || payload.timeSlot || 'N/A'}
Therapist Specialist: ${payload.practitionerName || payload.practitioner?.name || 'N/A'}
-----------------------------
Clinical Parameters:
- Delivery Date: ${payload.userDetails?.deliveryDate || 'N/A'}
- Delivery Type: ${payload.userDetails?.deliveryType || 'N/A'}
- Surgical Wound Suture condition (for LSCS): ${payload.userDetails?.stitchCondition || 'N/A'}
- Baby Name / Age Weeks: ${payload.userDetails?.babyName || 'N/A'} (${payload.userDetails?.babyAgeWeeks || 'N/A'} Weeks old)
-----------------------------
Home Visit Physical Address:
- Full Residence Location: ${payload.userDetails?.address || 'N/A'}
- Target City: ${payload.userDetails?.city || 'N/A'}
- Regional PIN code: ${payload.userDetails?.pincode || 'N/A'}
-----------------------------
Finance Info:
- Base Rate: Rs. ${payload.priceInr || 1499}/-
- GST Aspect (18%): Rs. ${payload.gstInr || Math.round((payload.priceInr || 1499) * 0.18)}/-
- Grand Total INR: Rs. ${payload.finalPriceInr || Math.round((payload.priceInr || 1499) * 1.18)}/-
======================================================

Execute WhatsApp coordination with the client immediately!

System Auto-Logger,
MaatriSparsh Internal Notification Service
    `;

    // 1. Dispatch User Email (via EmailJS Public Endpoint)
    if (serviceId && userTemplateId && publicKey) {
      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: userTemplateId,
            user_id: publicKey,
            template_params: {
              to_name: payload.customerName || payload.userDetails?.motherName,
              to_email: userEmailAddress,
              booking_id: payload.id || payload.bookingId,
              service_name: payload.serviceName || payload.service?.name,
              booking_date: payload.bookingDate || payload.date,
              booking_time: payload.bookingTime || payload.timeSlot,
              final_price: payload.finalPriceInr,
              message_body: userEmailBody
            }
          })
        });
        console.log(`[EmailJS] Booking confirmation successfully sent to user ${userEmailAddress}`);
      } catch (err) {
        console.error('Failed to dispatch user confirmation email via EmailJS:', err);
      }
    } else if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'MaatriSparsh Care <care@maatrisparsh.com>',
            to: [userEmailAddress],
            subject: `Booking Confirmed: MaatriSparsh Care Package Session (${payload.id || payload.bookingId})`,
            text: userEmailBody
          })
        });
        console.log(`[Resend] Booking confirmation successfully sent to user ${userEmailAddress}`);
      } catch (err) {
        console.error('Failed to dispatch user confirmation email via Resend:', err);
      }
    } else {
      console.warn('[Email Integration] User SMTP/Email credentials not configured yet. Detailed email payload generated inside activityLogs.');
    }

    // 2. Dispatch Admin Email (via EmailJS Public Endpoint)
    if (serviceId && adminTemplateId && publicKey) {
      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: adminTemplateId,
            user_id: publicKey,
            template_params: {
              to_name: 'MaatriSparsh Admin',
              to_email: adminEmailAddress,
              booking_id: payload.id || payload.bookingId,
              service_name: payload.serviceName || payload.service?.name,
              booking_date: payload.bookingDate || payload.date,
              booking_time: payload.bookingTime || payload.timeSlot,
              final_price: payload.finalPriceInr,
              message_body: adminEmailBody
            }
          })
        });
        console.log(`[EmailJS] New booking notification successfully sent to admin ${adminEmailAddress}`);
      } catch (err) {
        console.error('Failed to dispatch admin notification email via EmailJS:', err);
      }
    } else if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'MaatriSparsh Care Alerts <alerts@maatrisparsh.com>',
            to: [adminEmailAddress],
            subject: `🚨 Booking Arrived: New Care Package scheduled (${payload.id || payload.bookingId})`,
            text: adminEmailBody
          })
        });
        console.log(`[Resend] New booking notification successfully sent to admin ${adminEmailAddress}`);
      } catch (err) {
        console.error('Failed to dispatch admin notification email via Resend:', err);
      }
    } else {
      console.warn('[Email Integration] Admin SMTP/Email credentials not configured yet. Detailed email payload generated inside activityLogs.');
    }

    try {
      // Record detailed template logging documents in activityLogs collection
      await addDoc(collection(db, 'activityLogs'), {
        adminEmail: adminEmailAddress,
        action: 'EMAIL_BOUND_DATA',
        details: `USER CONFIRMATION EMAIL (To: ${userEmailAddress}):\n${userEmailBody}\n\nADMIN NOTIFICATION EMAIL (To: ${adminEmailAddress}):\n${adminEmailBody}`,
        timestamp: new Date().toISOString()
      });
    } catch (logErr) {
      console.error("Failed to append full raw email logs:", logErr);
    }
  };

  const logAdminAction = async (action: string, details: string) => {
    try {
      const emailLog = user?.email || 'maatrisparsh@gmail.com';
      await addDoc(collection(db, 'activityLogs'), {
        adminEmail: emailLog,
        action,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to append activity audit log:", err);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
      throw err;
    }
  };

  const setupRecaptcha = (containerId: string) => {
    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
        });
      }
    } catch (e) {
      console.error("Recaptcha setup error", e);
    }
  };

  const signInWithPhone = async (phoneNumber: string, isRegistering?: boolean, pendingData?: { fullName: string; email: string }) => {
    setError(null);
    setLoading(true);
    try {
      // 1. Prevent duplicate accounts or check account existence
      const q = query(collection(db, 'users'), where('phone', '==', phoneNumber));
      const docSnapshots = await getDocs(q);
      const exists = !docSnapshots.empty;

      if (isRegistering && exists) {
        throw new Error(
          window.location.hash.includes('lang=hi') ? 'यह फ़ोन नंबर पहले से पंजीकृत है। कृपया साइन इन करें।' : 'This phone number is already registered with an active profile. Please select Sign In.'
        );
      }
      if (!isRegistering && !exists) {
        throw new Error(
          window.location.hash.includes('lang=hi') ? 'इस फ़ोन नंबर के लिए कोई प्रोफ़ाइल नहीं मिली। कृपया पहले खाता बनाएं।' : 'No care profile found for this phone number. Please Create an Account first.'
        );
      }

      if (isRegistering && pendingData) {
        setPendingRegistration({
          fullName: pendingData.fullName,
          email: pendingData.email || '',
          phoneNumber: phoneNumber
        });
      } else {
        setPendingRegistration(null);
      }

      const appVerifier = (window as any).recaptchaVerifier;
      if (!appVerifier) {
        throw new Error('reCAPTCHA security verifier is initializing. Please try again in 2 seconds.');
      }

      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP verification code.');
      setLoading(false);
      throw err;
    }
  };

  const verifyPhoneCode = async (code: string) => {
    if (!confirmationResult) throw new Error('No confirmation results active. Click resend to try again.');
    setError(null);
    setLoading(true);
    try {
      const credential = await confirmationResult.confirm(code);
      const firebaseUser = credential.user;

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists() && pendingRegistration) {
          const profileData = {
            uid: firebaseUser.uid,
            email: pendingRegistration.email || '',
            motherName: pendingRegistration.fullName,
            fullName: pendingRegistration.fullName,
            phone: pendingRegistration.phoneNumber,
            phoneNumber: pendingRegistration.phoneNumber,
            profileImage: '',
            role: 'client',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            isVerified: true
          };
          await setDoc(userRef, profileData);

          setUserProfile({
            ...profileData,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
          setPendingRegistration(null);
        } else if (docSnap.exists()) {
          const currentProfile = docSnap.data();
          await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
          
          setUserProfile({
            uid: currentProfile.uid,
            email: currentProfile.email || '',
            motherName: currentProfile.motherName || currentProfile.fullName || 'Verified Member',
            fullName: currentProfile.fullName || currentProfile.motherName || 'Verified Member',
            phone: currentProfile.phone || currentProfile.phoneNumber || '',
            phoneNumber: currentProfile.phoneNumber || currentProfile.phone || '',
            profileImage: currentProfile.profileImage || '',
            role: currentProfile.role || 'client',
            createdAt: currentProfile.createdAt,
            lastLogin: new Date().toISOString(),
            isVerified: currentProfile.isVerified === true
          });
        }
      }

      setConfirmationResult(null);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP code entered.');
      setLoading(false);
      throw err;
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        bookings,
        services,
        coupons,
        allUsersList,
        activityLogs,
        priceHistoryLogs,
        loading,
        error,
        authReady,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        logOut,
        updateUserProfile,
        addBooking,
        cancelBookingInFirestore,
        confirmBookingInFirestore,
        editBookingInFirestore,
        deleteBookingInFirestore,
        sendPasswordReset,
        setupRecaptcha,
        signInWithPhone,
        verifyPhoneCode,
        checkEmailVerificationStatus,
        resendSecondaryVerification,
        
        addOrUpdateService,
        deleteService,
        addOrUpdateCoupon,
        deleteCoupon,
        logAdminAction,
        
        reviews,
        addReviewInFirestore,
        editReviewInFirestore,
        deleteReviewInFirestore
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}
