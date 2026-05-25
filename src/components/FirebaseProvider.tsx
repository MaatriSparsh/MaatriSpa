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
  User as FirebaseUser 
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

export default function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [priceHistoryLogs, setPriceHistoryLogs] = useState<PriceHistoryLog[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<{ fullName: string; email: string; phoneNumber: string } | null>(null);

  const isAdmin = user?.email?.toLowerCase() === 'spaar161.pk@gmail.com';

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
    // If Admin, sync ALL reviews (Pending, Approved, Rejected). Otherwise, only sync Approved reviews.
    const q = (user && isAdmin)
      ? query(collection(db, reviewsPath))
      : query(collection(db, reviewsPath), where('status', '==', 'Approved'));

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
            serviceName: d.serviceName || '',
            childName: d.childName || '',
            mediaUrl: d.mediaUrl || '',
            mediaType: d.mediaType || 'none',
            status: d.status || 'Pending',
            isFeatured: d.isFeatured === true,
            createdAt: d.createdAt || new Date().toISOString()
          });
        });

        // Dynamic sorting: Featured first, followed by Latest reviews
        list.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setReviews(list);
      },
      (err) => {
        console.warn("Reviews sync restriction / missing rules sync:", err.message);
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
          isVerified: true
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
          isVerified: true
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
          isVerified: true
        };
        await setDoc(userRef, profileData);
        
        setUserProfile({
          ...profileData,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
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

  const logAdminAction = async (action: string, details: string) => {
    try {
      const emailLog = user?.email || 'spaar161.pk@gmail.com';
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
