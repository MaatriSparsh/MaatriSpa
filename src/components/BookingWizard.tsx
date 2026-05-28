import { useState, FormEvent, useEffect } from 'react';
import { X, Calendar, User, Clock, Check, ChevronRight, ChevronLeft, Heart, Baby, CheckCircle, Award } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Service, Practitioner, Booking } from '../types';
import { SERVICES as STATIC_SERVICES, PRACTITIONERS } from '../data';
import { useFirebase } from './FirebaseProvider';
import { useLanguage } from './LanguageProvider';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const parseCoordinatesFromUrl = (url: string) => {
  if (!url) return null;
  // Patterns like q=lat,lng or place/lat,lng or @lat,lng
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }
  const placeMatch = url.match(/\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (placeMatch) {
    return { lat: parseFloat(placeMatch[1]), lng: parseFloat(placeMatch[2]) };
  }
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }
  // Also support simple comma separated lat, lng
  const rawCoordsMatch = url.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (rawCoordsMatch) {
    return { lat: parseFloat(rawCoordsMatch[1]), lng: parseFloat(rawCoordsMatch[2]) };
  }
  return null;
};

const formatWhatsAppNumber = (rawPhone: string) => {
  if (!rawPhone) return '';
  let clean = rawPhone.replace(/\D/g, ''); // strip all non-digits
  if (clean.length === 10) {
    // default India country code (+91)
    clean = '91' + clean;
  }
  return clean;
};

interface BookingWizardProps {
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  preselectedServiceId?: string;
}

export default function BookingWizard({ onClose, onBookingSuccess, preselectedServiceId }: BookingWizardProps) {
  const { user, userProfile, addBooking, services, occupiedSlots, isAdmin, allUsersList } = useFirebase();
  const { t, language } = useLanguage();

  const isEmailUser = user?.providerData.some((p) => p.providerId === 'password');
  const isPendingVerification = isAdmin 
    ? false 
    : !!(user && isEmailUser && !user.emailVerified && !userProfile?.isVerified);

  const allServices = services && services.length > 0 ? services : STATIC_SERVICES;
  // Restrict strictly to care packages (category: postpartum_mother)
  const activeServices = allServices.filter(s => s.category === 'postpartum_mother');

  // Wizard steps: 'service' | 'practitioner' | 'slot' | 'details' | 'success'
  const [step, setStep] = useState<'service' | 'practitioner' | 'slot' | 'details' | 'success'>('service');

  // Booking details selection
  const [selectedService, setSelectedService] = useState<Service>(() => {
    if (preselectedServiceId) {
      const found = activeServices.find(s => s.id === preselectedServiceId);
      if (found) return found;
    }
    return activeServices[0];
  });

  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner>(PRACTITIONERS[0]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const [selectedTargetUserId, setSelectedTargetUserId] = useState<string>('');

  // Auto-reset slot selection if it becomes unavailable on the active date
  useEffect(() => {
    if (selectedSlot) {
      const isTaken = occupiedSlots?.some(
        (occ) =>
          occ.date === selectedDate &&
          occ.timeSlot.trim().toLowerCase() === selectedSlot.trim().toLowerCase()
      );
      if (isTaken) {
        setSelectedSlot('');
      }
    }
  }, [selectedDate, occupiedSlots, selectedSlot]);

  const [motherName, setMotherName] = useState(() => userProfile?.motherName || '');
  const [babyName, setBabyName] = useState('');
  const [babyAgeWeeks, setBabyAgeWeeks] = useState('');
  const [email, setEmail] = useState(() => userProfile?.email || user?.email || '');
  const [phone, setPhone] = useState(() => userProfile?.phone || userProfile?.phoneNumber || '');
  const [notes, setNotes] = useState('');

  // Custom package criteria states
  const [deliveryType, setDeliveryType] = useState<'normal' | 'lscs' | 'none'>(() => {
    if (selectedService.id.startsWith('normal-')) return 'normal';
    if (selectedService.id.startsWith('lscs-')) return 'lscs';
    return 'none';
  });
  const [deliveryDate, setDeliveryDate] = useState('');
  const [city, setCity] = useState<'Raipur' | 'Bhilai' | 'Durg' | ''>(() => {
    return 'Raipur'; // Default to Raipur to avoid unselected city error
  });
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [stitchCondition, setStitchCondition] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [areaAccepted, setAreaAccepted] = useState(false);

  // Google Maps Coordinates and tracking URL
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('');
  const [mapCenter, setMapCenter] = useState({ lat: 21.2512, lng: 81.6296 });
  const [mapZoom, setMapZoom] = useState(13);
  const [sendEmailConfirm, setSendEmailConfirm] = useState(true);
  const [isMapAuthFailed, setIsMapAuthFailed] = useState(() => (window as any).GOOGLE_MAPS_AUTH_FAILED || false);

  useEffect(() => {
    const handleAuthFailure = () => {
      setIsMapAuthFailed(true);
    };
    window.addEventListener('google-maps-auth-failed', handleAuthFailure);
    return () => {
      window.removeEventListener('google-maps-auth-failed', handleAuthFailure);
    };
  }, []);

  // Automatically center map and set default pins when city changes
  useEffect(() => {
    if (city === 'Raipur') {
      const coords = { lat: 21.2512, lng: 81.6296 };
      setMapCenter(coords);
      if (!latitude) {
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        setGoogleMapsUrl(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`);
      }
    } else if (city === 'Bhilai') {
      const coords = { lat: 21.1904, lng: 81.3917 };
      setMapCenter(coords);
      if (!latitude) {
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        setGoogleMapsUrl(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`);
      }
    } else if (city === 'Durg') {
      const coords = { lat: 21.1859, lng: 81.2777 };
      setMapCenter(coords);
      if (!latitude) {
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        setGoogleMapsUrl(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`);
      }
    }
  }, [city]);

  useEffect(() => {
    if (selectedService.id.startsWith('normal-')) {
      setDeliveryType('normal');
    } else if (selectedService.id.startsWith('lscs-')) {
      setDeliveryType('lscs');
    } else {
      setDeliveryType('none');
    }
  }, [selectedService]);

  useEffect(() => {
    if (userProfile) {
      if (!motherName) setMotherName(userProfile.motherName || userProfile.fullName || '');
      if (!email) setEmail(userProfile.email || '');
      if (!phone) setPhone(userProfile.phone || userProfile.phoneNumber || '');
    }
  }, [userProfile]);

  const [validationError, setValidationError] = useState('');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  const handleSelectTargetUser = (userId: string) => {
    setSelectedTargetUserId(userId);
    if (!userId) {
      setMotherName('');
      setEmail('');
      setPhone('');
      return;
    }
    const selectedUserRecord = allUsersList?.find((usr: any) => usr.uid === userId);
    if (selectedUserRecord) {
      setMotherName(selectedUserRecord.motherName || selectedUserRecord.fullName || '');
      setEmail(selectedUserRecord.email || '');
      setPhone(selectedUserRecord.phone || selectedUserRecord.phoneNumber || '');
    }
  };

  // Modern Calendar State & Helpers
  const today = new Date();
  const getYYYYMMDD = (dOrYear: Date | number, month?: number, day?: number) => {
    if (dOrYear instanceof Date) {
      const y = dOrYear.getFullYear();
      const m = String(dOrYear.getMonth() + 1).padStart(2, '0');
      const dayVal = String(dOrYear.getDate()).padStart(2, '0');
      return `${y}-${m}-${dayVal}`;
    } else if (typeof dOrYear === 'number' && typeof month === 'number' && typeof day === 'number') {
      const m = String(month + 1).padStart(2, '0');
      const dayVal = String(day).padStart(2, '0');
      return `${dOrYear}-${m}-${dayVal}`;
    }
    return '';
  };
  const todayStr = getYYYYMMDD(today);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(todayStr);
    }
  }, [selectedDate, todayStr]);

  const handlePrevMonth = () => {
    if (currentYear === today.getFullYear() && currentMonth <= today.getMonth()) {
      return;
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // 15-Minute Dynamic Slot Generation (9:00 AM to 6:00 PM)
  const timeSlotsCustomList = (() => {
    const list: string[] = [];
    let h = 9;
    let m = 0;
    while (h < 18) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const fM = String(m).padStart(2, '0');
      list.push(`${displayHour}:${fM} ${ampm}`);
      m += 15;
      if (m >= 60) {
        m = 0;
        h += 1;
      }
    }
    return list;
  })();

  const isSlotPastToday = (slot: string) => {
    if (selectedDate !== todayStr) return false;
    const parts = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!parts) return false;
    let hrs = parseInt(parts[1], 10);
    const mins = parseInt(parts[2], 10);
    const ampm = parts[3].toUpperCase();
    if (ampm === 'PM' && hrs !== 12) hrs += 12;
    if (ampm === 'AM' && hrs === 12) hrs = 0;
    const slotMins = hrs * 60 + mins;
    const currentMins = today.getHours() * 60 + today.getMinutes();
    return slotMins < currentMins;
  };

  // Handle service selection change
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    // Auto-recommend appropriate practitioner based on service specialties
    if (service.category === 'postpartum_mother') {
      setSelectedPractitioner(PRACTITIONERS[0]); // Meera Nair
    } else if (service.category === 'newborn_baby' || service.id === 'lactation-consult') {
      setSelectedPractitioner(PRACTITIONERS[1]); // Dr Shreya Joshi
    } else {
      setSelectedPractitioner(PRACTITIONERS[2]); // Pallavi Sen
    }
  };

  const handleNextStep = () => {
    setValidationError('');
    if (step === 'service') {
      setStep('slot');
    } else if (step === 'slot') {
      if (!selectedSlot) {
        setValidationError(
          language === 'en' 
            ? 'Kindly select a convenient hours appointment slot.'
            : 'कृपया अपनी सुविधानुसार समय स्लॉट का चयन करें।'
        );
        return;
      }
      if (isPendingVerification) {
        setValidationError(
          language === 'en'
            ? 'Kindly verify your email address to unlock session booking. Please check your email inbox for the activation link.'
            : 'सत्र बुकिंग अनलॉक करने के लिए कृपया अपना ईमेल सत्यापित करें। कृपया अपने ईमेल इनबॉक्स में सत्यापन लिंक की जांच करें।'
        );
        return;
      }
      setStep('details');
    }
  };

  const handlePrevStep = () => {
    setValidationError('');
    if (step === 'slot') {
      setStep('service');
    } else if (step === 'details') {
      setStep('slot');
    }
  };

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (isPendingVerification) {
      setValidationError(
        language === 'en'
          ? 'Maternal account verification pending. You must click the activation link sent to your email to book.'
          : 'मातृत्व खाते का सत्यापन लंबित है। बुक करने के लिए आपको अपने ईमेल पर भेजे गए लिंक पर क्लिक करना होगा।'
      );
      return;
    }

    if (!motherName || !email) {
      setValidationError(
        language === 'en'
          ? 'Please specify the Mother’s Name and email coordinate.'
          : 'कृपया माता का नाम और ईमेल आईडी दर्ज करें।'
      );
      return;
    }

    // Dynamic Package Criteria validation (Bypassed for administrator/admin proxy bookings)
    if (selectedService.category === 'postpartum_mother' && !isAdmin) {
      if (!deliveryDate) {
        setValidationError(
          language === 'en'
            ? 'Please specify your Date of Delivery / Surgery.'
            : 'कृपया अपने प्रसव / सर्जरी की तिथि का चयन करें।'
        );
        return;
      }
      if (!city) {
        setValidationError(
          language === 'en'
            ? 'Postpartum home care is exclusive to Raipur, Bhilai, and Durg. Please select your city.'
            : 'प्रसवोत्तर होम केयर केवल रायपुर, भिलाई और दुर्ग में उपलब्ध है। कृपया अपना शहर चुनें।'
        );
        return;
      }
      if (!address || address.trim().length < 8) {
        setValidationError(
          language === 'en'
            ? 'Please provide a complete residential address for therapist home visits.'
            : 'थेरेपिस्ट होम विजिट के लिए कृपया पूरा पता भरें।'
        );
        return;
      }
      if (!areaAccepted) {
        setValidationError(
          language === 'en'
            ? 'You must confirm that your residence is within Raipur, Bhilai, or Durg metro area.'
            : 'कृपया पुष्टि करें कि आपका निवास रायपुर, भिलाई या दुर्ग क्षेत्र के भीतर है।'
        );
        return;
      }

      // Check for delivery type mismatch
      const isNormalColl = selectedService.id.startsWith('normal-');
      const isLscsColl = selectedService.id.startsWith('lscs-');
      if (isNormalColl && deliveryType !== 'normal') {
        setValidationError(
          language === 'en'
            ? 'This is a Normal Delivery Care package, but C-Section is specified as delivery type. Please align your selection.'
            : 'यह नॉर्मल डिलीवरी केयर पैकेज है, लेकिन प्रसव का प्रकार सिजेरियन चुना गया है। कृपया संरेखित करें।'
        );
        return;
      }
      if (isLscsColl && deliveryType !== 'lscs') {
        setValidationError(
          language === 'en'
            ? 'This is an LSCS (Cesarean) Care package, but Normal Delivery is specified as delivery type. Please align your selection.'
            : 'यह सिजेरियन केयर पैकेज है, लेकिन प्रसव का प्रकार नॉर्मल डिलीवरी चुना गया है। कृपया संरेखित करें।'
        );
        return;
      }
    }

    const bookingId = `msb-${Math.floor(100000 + Math.random() * 900000)}`;

    const bookingPayload: Booking = {
      id: bookingId,
      bookingId: bookingId,
      customerName: motherName,
      email: email,
      phone: phone,
      bookingDate: selectedDate,
      bookingTime: selectedSlot,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      notes: notes || undefined,
      paymentStatus: 'Pending',
      bookingStatus: 'Confirmed',
      createdAt: new Date().toISOString(),
      
      service: selectedService,
      practitioner: selectedPractitioner,
      date: selectedDate,
      timeSlot: selectedSlot,
      userDetails: {
        motherName,
        babyName: babyName || undefined,
        babyAgeWeeks: babyAgeWeeks || undefined,
        email,
        phone,
        notes: notes || undefined,
        deliveryType: selectedService.category === 'postpartum_mother' ? deliveryType : undefined,
        deliveryDate: selectedService.category === 'postpartum_mother' ? deliveryDate : undefined,
        city: selectedService.category === 'postpartum_mother' ? city : undefined,
        address: selectedService.category === 'postpartum_mother' ? address : undefined,
        pincode: selectedService.category === 'postpartum_mother' ? (pincode || undefined) : undefined,
        stitchCondition: selectedService.id.startsWith('lscs-') ? (stitchCondition || undefined) : undefined,
        focusArea: selectedService.category === 'consultation' ? (focusArea || undefined) : undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        googleMapsUrl: googleMapsUrl || undefined,
      },
      status: 'Confirmed',
      
      originalPrice: selectedService.priceInr,
      priceInr: selectedService.priceInr,
      discountedPriceApplied: selectedService.priceInr,
      gstInr: Math.round(selectedService.priceInr * 0.18),
      finalPriceInr: Math.round(selectedService.priceInr * 1.18)
    };

    try {
      // Securely write booking to Firestore instead of local storage
      await addBooking({
        id: bookingId,
        bookingId: bookingId,
        customerName: motherName,
        email: email,
        phone: phone,
        bookingDate: selectedDate,
        bookingTime: selectedSlot,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        notes: notes || undefined,
        paymentStatus: 'Pending',
        bookingStatus: 'Confirmed',
        createdAt: new Date().toISOString(),
        
        service: selectedService,
        practitioner: selectedPractitioner,
        date: selectedDate,
        timeSlot: selectedSlot,
        userDetails: {
          motherName,
          babyName: babyName || undefined,
          babyAgeWeeks: babyAgeWeeks || undefined,
          email,
          phone,
          notes: notes || undefined,
          deliveryType: selectedService.category === 'postpartum_mother' ? deliveryType : undefined,
          deliveryDate: selectedService.category === 'postpartum_mother' ? deliveryDate : undefined,
          city: selectedService.category === 'postpartum_mother' ? city : undefined,
          address: selectedService.category === 'postpartum_mother' ? address : undefined,
          pincode: selectedService.category === 'postpartum_mother' ? (pincode || undefined) : undefined,
          stitchCondition: selectedService.id.startsWith('lscs-') ? (stitchCondition || undefined) : undefined,
          focusArea: selectedService.category === 'consultation' ? (focusArea || undefined) : undefined,
          latitude: latitude || undefined,
          longitude: longitude || undefined,
          googleMapsUrl: googleMapsUrl || undefined,
        },
        status: 'Confirmed',
        
        originalPrice: selectedService.priceInr,
        priceInr: selectedService.priceInr,
        discountedPriceApplied: selectedService.priceInr,
        gstInr: Math.round(selectedService.priceInr * 0.18),
        finalPriceInr: Math.round(selectedService.priceInr * 1.18)
      }, selectedTargetUserId || undefined, !sendEmailConfirm);

      setCreatedBooking(bookingPayload);
      setStep('success');
      onBookingSuccess(bookingPayload);
    } catch (err: any) {
      console.error(err);
      setValidationError(
        language === 'en' 
          ? (err?.message || 'Access Denied: Could not lock this reservation time block.')
          : (err?.message || 'त्रुटि: बुकिंग ब्लॉक को सुरक्षित करने में बाधा आई। दोबारा प्रयास करें।')
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Main Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5 bg-stone-50">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-rose-100">
              <Calendar className="h-4.5 w-4.5 text-rose-250 shrink-0" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 leading-none">
                {language === 'en' ? 'Schedule Holistic Care' : 'मातृत्व सेवा सत्र बुक करें'}
              </h3>
              <p className="text-[10px] text-stone-500 font-mono tracking-wide uppercase mt-1">
                {language === 'en' ? 'Step-by-step Postpartum Scheduling' : 'प्रसवोत्तर उपचार चयन प्रणाली'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-200/50 hover:text-stone-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Multi-Step Progress Tracker Bar */}
        {step !== 'success' && (
          <div className="bg-stone-100 border-b border-stone-250/50 px-6 py-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-stone-500">
            {[
              { id: 'service', en: '1. Package', hi: '१. पैकेज' },
              { id: 'slot', en: '2. Hour / Date', hi: '२. समय' },
              { id: 'details', en: '3. Mom & Baby', hi: '३. प्रोफाइल' }
            ].map((pstep) => {
              const activeIds = ['service', 'slot', 'details'];
              const currentIdx = activeIds.indexOf(step as any);
              const stepIdx = activeIds.indexOf(pstep.id as any);
              const isActive = currentIdx === stepIdx;
              const isPassed = stepIdx < currentIdx;

              return (
                <div
                  key={pstep.id}
                  className={`py-1 rounded-sm ${
                    isActive ? 'text-emerald-900 border-b-2 border-emerald-800' : isPassed ? 'text-emerald-800' : 'opacity-60'
                  }`}
                >
                  {language === 'en' ? pstep.en : pstep.hi}
                </div>
              );
            })}
          </div>
        )}

        {/* Wizard body container scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {validationError && (
            <div className="bg-amber-50 border border-amber-200 text-stone-800 p-3 rounded-xl text-xs mb-4">
              ⚠️ {validationError}
            </div>
          )}

          {/* STEP 1: Select Care Service */}
          {step === 'service' && (
            <div className="space-y-4" id="wizard-select-service">
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-stone-900">
                  {isAdmin 
                    ? (language === 'en' ? 'Choose Service or Program' : 'सेवा या उपचार पैकेज का चयन करें')
                    : (language === 'en' ? 'Choose Postnatal Treatment Program' : 'उपचार पैकेज का चयन करें')}
                </h4>
                <p className="text-xs text-stone-500">
                  {isAdmin 
                    ? (language === 'en' ? 'Select any service from all available packages, consultations, and workshops.' : 'सभी उपलब्ध पैकेजों, परामर्श और कार्यशालाओं में से किसी भी सेवा का चयन करें।')
                    : (language === 'en' 
                      ? 'Our systems focus on maternal musculoskeletal restoration and baby colic protection.'
                      : 'हड्डियों के संरेखण पीठ दर्द निवारक, सूतिका मालिश और बच्चे के पेट दर्द से राहत देने वाले पैकेजेस।')}
                </p>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {activeServices.map((srv) => {
                  if (!srv.activeStatus) return null;
                  const srvName = language === 'en' ? srv.name : srv.nameHindi;
                  const srvDesc = language === 'en' ? srv.description : srv.descriptionHindi;

                  return (
                    <button
                      key={srv.id}
                      onClick={() => handleSelectService(srv)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                        selectedService.id === srv.id
                          ? 'border-emerald-800 bg-emerald-50/30'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <span className="font-serif text-xs sm:text-sm font-bold text-stone-900 block leading-tight">
                          {srvName}
                        </span>
                        <span className="text-xs text-stone-500 block line-clamp-2 leading-relaxed">
                          {srvDesc}
                        </span>
                        <span className="inline-flex gap-3 text-[10px] text-stone-400 font-mono mt-1">
                          <span>⏱ {srv.duration} {language === 'en' ? 'mins' : 'मिनट'}</span>
                          <span>•</span>
                          <span>{language === 'en' ? 'Category' : 'श्रेणी'}: {srv.category.replace('_', ' ')}</span>
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block font-serif font-black text-sm sm:text-base text-emerald-800 leading-none">
                          ₹{srv.priceInr.toLocaleString('en-IN')}
                        </span>
                        {selectedService.id === srv.id && (
                          <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-emerald-800 uppercase mt-1">
                            <Check className="h-3.5 w-3.5" />
                            <span>{language === 'en' ? 'Selected' : 'चयनित'}</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Choose Specialist */}
          {step === 'practitioner' && (
            <div className="space-y-4" id="wizard-select-practitioner">
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-stone-900">
                  {language === 'en' ? 'Choose Certified Specialist' : 'प्रमाणित प्रसवोत्तर दाई/विशेषज्ञ सलाहकार चुनें'}
                </h4>
                <p className="text-xs text-stone-500">
                  {language === 'en' 
                    ? `Based on ${selectedService.name}, we recommend our certified specialist:`
                    : `${language === 'en' ? selectedService.name : selectedService.nameHindi} के लिए अनुशंसित विशेषज्ञ:`}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {PRACTITIONERS.map((practi) => (
                  <button
                    key={practi.id}
                    onClick={() => setSelectedPractitioner(practi)}
                    className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                      selectedPractitioner.id === practi.id
                        ? 'border-emerald-800 bg-emerald-50/30'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={practi.avatar}
                          alt={practi.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <strong className="block font-serif text-xs font-bold text-stone-900">{practi.name}</strong>
                          <span className="block text-[9px] text-stone-500">
                            {language === 'en' ? practi.role.split('&')[0] : practi.roleHindi.split('|')[0]}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-600 leading-relaxed line-clamp-3">
                        {language === 'en' ? practi.bio : practi.bioHindi}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-stone-200/50 flex items-center justify-between w-full">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                        ★ {practi.rating} ({practi.id === 'practitioner-meera' ? 124 : practi.id === 'practitioner-shreya' ? 98 : 47} {language === 'en' ? 'reviews' : 'समीक्षा'})
                      </span>
                      {selectedPractitioner.id === practi.id && (
                        <span className="rounded-full bg-emerald-800 text-stone-50 p-0.5"><Check className="h-3 w-3" /></span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Select Date & Time slot */}
          {step === 'slot' && (
            <div className="space-y-5" id="wizard-select-slot">
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-stone-900 border-b border-stone-100 pb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-emerald-800" />
                  {language === 'en' ? 'Select Date & Preferred Session Hour' : 'तिथि और पसंदीदा समय का चयन करें'}
                </h4>
                <p className="text-[11px] text-stone-500">
                  {language === 'en' 
                    ? 'Please use our interactive calendar below to secure a date. Past dates are disabled.'
                    : 'तारीख का चयन करने के लिए कैलेंडर का उपयोग करें। पुरानी तारीखें अक्षम कर दी गई हैं।'}
                </p>
              </div>

              {/* Monthly Calendar UI Format */}
              <div className="border border-stone-200 rounded-2xl bg-white p-3 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 font-serif">
                    {new Date(currentYear, currentMonth).toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      disabled={currentYear === today.getFullYear() && currentMonth <= today.getMonth()}
                      className="p-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 cursor-pointer transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Day legends */}
                <div className="grid grid-cols-7 text-center text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest pb-1 border-b border-stone-100">
                  {language === 'en' 
                    ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)
                    : ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'].map(d => <span key={d}>{d}</span>)}
                </div>

                {/* Grid of days */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarCells.map((cellDay, idx) => {
                    if (cellDay === null) {
                      return <div key={`empty-${idx}`} />;
                    }

                    const cellDateStr = getYYYYMMDD(currentYear, currentMonth, cellDay);
                    const isSelected = selectedDate === cellDateStr;
                    const isPast = cellDateStr < todayStr;

                    return (
                      <button
                        key={`day-${cellDateStr}`}
                        type="button"
                        disabled={isPast}
                        onClick={() => {
                          setSelectedDate(cellDateStr);
                          setSelectedSlot(''); // Reset slot on changing date to prevent mismatch
                        }}
                        className={`py-2 text-xs rounded-xl font-medium transition-all ${
                          isPast
                            ? 'text-stone-300 bg-stone-50/50 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-emerald-800 text-stone-50 font-extrabold shadow-xs hover:bg-emerald-900 border border-emerald-800 cursor-pointer'
                            : 'text-stone-750 bg-white hover:bg-stone-100 border border-stone-150 cursor-pointer'
                        }`}
                        title={isPast ? (language === 'en' ? 'Unavailable - Past Date' : 'अनुपलब्ध - पुरानी तिथि') : undefined}
                      >
                        {cellDay}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots chooser with 15-minute interval slots */}
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <div className="flex justify-between items-baseline pb-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3 text-stone-400" />
                    {language === 'en' ? 'Select Available Time Slot' : 'समय सीमा चुनें'}
                  </label>
                  {selectedDate && (
                    <span className="text-[10px] font-mono text-emerald-805 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      {selectedDate}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-52 overflow-y-auto pr-1">
                  {timeSlotsCustomList.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    const isTaken = occupiedSlots?.some(
                      (occ) =>
                        occ.date === selectedDate &&
                        occ.timeSlot.trim().toLowerCase() === slot.trim().toLowerCase()
                    );
                    const isPastTS = isSlotPastToday(slot);
                    const isDisabled = isTaken || isPastTS;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 rounded-xl border text-[11px] font-semibold tracking-wide text-center transition-all ${
                          isTaken
                            ? 'border-red-150 bg-red-50/60 text-stone-400 cursor-not-allowed relative opacity-80'
                            : isPastTS
                            ? 'border-stone-200 bg-stone-50 text-stone-350 cursor-not-allowed line-through relative opacity-50'
                            : isSelected
                            ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold cursor-pointer ring-1 ring-emerald-800 shadow-sm'
                            : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600 shadow-2xs cursor-pointer'
                        }`}
                        title={
                          isTaken 
                            ? (language === 'en' ? 'Booked - Choose another' : 'बुक है - दूसरा समय चुनें') 
                            : isPastTS 
                            ? (language === 'en' ? 'Unavailable - Past slot of today' : 'अनुपलब्ध - बीत चुका समय') 
                            : undefined
                        }
                      >
                        <span className="flex items-center justify-center gap-1.5 px-1 py-0.5">
                          <span>{slot}</span>
                          {isTaken ? (
                            <span className="text-[8.5px] font-mono font-bold text-red-650 uppercase bg-red-100 px-1 rounded bg-red-100 text-red-700 tracking-wide">
                              ({language === 'en' ? 'Booked' : 'बुक'})
                            </span>
                          ) : isPastTS ? (
                            <span className="text-[8.5px] font-mono font-semibold text-stone-400 uppercase tracking-wide">
                              ({language === 'en' ? 'Passed' : 'बीता'})
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: user and baby Details */}
          {step === 'details' && (
            <form onSubmit={handleFinalSubmit} className="space-y-4" id="wizard-user-details-form">
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-stone-900">
                  {language === 'en' ? 'Maternal & Newborn Profile' : 'माता व नवजात विवरणी दर्ज करें'}
                </h4>
                <p className="text-xs text-stone-500">
                  {language === 'en' 
                    ? 'Provide valid contact coordinate details so our pediatrician coordinates session coordinates.'
                    : 'सत्र विवरणी और विशेषज्ञ के मार्ग दर्शन के लिए आवश्यक सामान्य जानकारी भरें।'}
                </p>
              </div>

              {isAdmin && allUsersList && allUsersList.length > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-2">
                  <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                    {language === 'en' ? 'Book on behalf of a Registered Mother (Optional)' : 'पंजीकृत माता की ओर से बुक करें (वैकल्पिक)'}
                  </label>
                  <select
                    value={selectedTargetUserId}
                    onChange={(e) => handleSelectTargetUser(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                  >
                    <option value="">
                      {language === 'en' ? '-- Select a Registered Mother (Manual Entry helper) --' : '-- पंजीकृत माता चुनें (या मैन्युअल दर्ज करें) --'}
                    </option>
                    {allUsersList.map((usr: any) => (
                      <option key={usr.uid} value={usr.uid}>
                        {usr.motherName || usr.fullName || 'Unnamed'} ({usr.email || usr.phone || usr.uid})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-stone-500 italic">
                    {language === 'en'
                      ? "Selecting a mother will auto-populate her profile details below."
                      : "किसी माता को चुनने से उनकी प्रोफाइल जानकारी नीचे स्वतः भर जाएगी।"}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    {language === 'en' ? "Mother's Full Name *" : 'माता का नाम *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="e.g. Kavitha Sharma"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/40 py-2.5 px-4 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    {language === 'en' ? "Baby’s Name (If Born)" : 'शिशु का नाम (यदि रखा गया हो)'}
                  </label>
                  <input
                    type="text"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    placeholder="e.g. Baby Dev"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/40 py-2.5 px-4 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    {language === 'en' ? 'Email coordinates *' : 'ईमेल आईडी *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mother@gmail.com"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/40 py-2.5 px-4 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    {language === 'en' ? 'Active Phone/Mobile Number *' : 'सक्रिय फोन/मोबाइल नंबर *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, ''))}
                    placeholder="e.g. +91 9183216100"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/40 py-2.5 px-4 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center space-x-2.5 bg-stone-50/60 p-3 rounded-2xl border border-stone-150/80">
                  <input
                    type="checkbox"
                    id="send-email-confirm"
                    checked={sendEmailConfirm}
                    onChange={(e) => setSendEmailConfirm(e.target.checked)}
                    className="h-4 w-4 text-emerald-805 border-stone-300 rounded focus:ring-emerald-800 cursor-pointer accent-emerald-800"
                  />
                  <label htmlFor="send-email-confirm" className="text-[11px] font-semibold text-stone-750 select-none cursor-pointer leading-tight">
                    {language === 'en' 
                      ? '📧 Send a beautifully styled session confirmation receipt to this email address automatically' 
                      : '📧 इस ईमेल पते पर स्वचालित रूप से सत्र पुष्टीकरण रसीद भेजें'}
                  </label>
                </div>
              </div>

              {/* --- DYNAMIC PACKAGE-SPECIFIC CRITERIA SECTION --- */}
              {selectedService.category === 'postpartum_mother' && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/40 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold block">
                    📋 {language === 'en' ? 'Postpartum Recovery Validation' : 'प्रसवोत्तर रिकवरी भौतिक सत्यापन मानदंड'}
                  </span>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Delivery / Surgery Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        {selectedService.id.startsWith('lscs-')
                          ? (language === 'en' ? 'Date of C-Section Surgery *' : 'सिजेरियन सर्जरी की तिथि *')
                          : (language === 'en' ? 'Date of Normal Delivery *' : 'नॉर्मल डिलीवरी की तिथि *')}
                      </label>
                      <input
                        type="date"
                        required
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-white py-2 px-3 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                      />
                    </div>

                    {/* Confirm Delivery Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        {language === 'en' ? 'Confirm Delivery Type *' : 'प्रसव के प्रकार की पुष्टि *'}
                      </label>
                      <select
                        value={deliveryType}
                        onChange={(e) => setDeliveryType(e.target.value as any)}
                        className="w-full rounded-xl border border-stone-200 bg-white py-2.5 px-3 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                      >
                        <option value="normal">{language === 'en' ? 'Normal / Vaginal Delivery' : 'नॉर्मल प्रसव (Vaginal)'}</option>
                        <option value="lscs">{language === 'en' ? 'C-Section / Cesarean (LSCS)' : 'सिजेरियन प्रसव (C-Section)'}</option>
                      </select>
                    </div>
                  </div>

                  {/* If C-section, state of stitches */}
                  {selectedService.id.startsWith('lscs-') && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        {language === 'en' ? 'Suture / Stitch Status' : 'टांकों की वर्तमान स्थिति'}
                      </label>
                      <select
                        value={stitchCondition}
                        onChange={(e) => setStitchCondition(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-white py-2.5 px-3 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                      >
                        <option value="">-- {language === 'en' ? 'Select Stitch Status' : 'टांकों की स्थिति चुनें'} --</option>
                        <option value="dissolvable">{language === 'en' ? 'Dissolvable (Under healing)' : 'घुलनशील टांके (भर रहे हैं)'}</option>
                        <option value="staples-removed">{language === 'en' ? 'Staples / Stitches Removed' : 'टांके / स्टेपल निकाल दिए गए हैं'}</option>
                        <option value="painful">{language === 'en' ? 'Active Pain / Tender Wound' : 'सक्रिय दर्द / टेंडर घाव'}</option>
                        <option value="not-sure">{language === 'en' ? 'Unsure (Will check with therapist)' : 'निश्चित नहीं (थेरेपिस्ट से सलाह लेंगे)'}</option>
                      </select>
                    </div>
                  )}

                  {/* Residential Home Address (exclusive Raipur metro) */}
                  <div className="space-y-3 pt-2 border-t border-amber-200/30">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#a16207] font-bold block">
                      📍 {language === 'en' ? 'Home Delivery Service Coordinates (Raipur-Bhilai-Durg Only)' : 'होम विजिट सेवा क्षेत्र पता (केवल रायपुर-भिलाई-दुर्ग)'}
                    </span>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                          {language === 'en' ? 'Service Metro City *' : 'सेवा क्षेत्र शहर *'}
                        </label>
                        <select
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value as any)}
                          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 px-3 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                        >
                          <option value="">-- {language === 'en' ? 'Choose Raipur Metro City' : 'रायपुर मेट्रो शहर चुनें'} --</option>
                          <option value="Raipur">{language === 'en' ? 'Raipur (रायपुर)' : 'रायपुर (Raipur)'}</option>
                          <option value="Bhilai">{language === 'en' ? 'Bhilai (भिलाई)' : 'भिलाई (Bhilai)'}</option>
                          <option value="Durg">{language === 'en' ? 'Durg (दुर्ग)' : 'दुर्ग (Durg)'}</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                          {language === 'en' ? 'Pincode' : 'पिनकोड'}
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 492001"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 px-3 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        {language === 'en' ? 'Complete Street Address (Home Visit Location) *' : 'पूरा आवासीय पता (होम विजिट स्थल) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={language === 'en' ? "Flat No, Building Name, Street, Landmark..." : "मकान नंबर, बिल्डिंग का नाम, गली, मुख्य मील का पत्थर..."}
                        className="w-full rounded-xl border border-stone-200 bg-white py-2.5 px-4 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                      />
                    </div>

                    {/* Google Maps Link / Coordinates Entry block */}
                    <div className="space-y-1.5 mt-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                          📍 {language === 'en' ? 'Google Maps Link / URL (Optional)' : 'गूगल मैप्स लिंक / यूआरएल (वैकल्पिक)'}
                        </label>
                        {googleMapsUrl && googleMapsUrl.startsWith('http') && (
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition cursor-pointer text-[9.5px]"
                          >
                            🗺️ {language === 'en' ? 'Click to Test Map Link' : 'नक्शा लिंक जांचें'}
                          </a>
                        )}
                      </div>
                      <input
                        type="text"
                        value={googleMapsUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGoogleMapsUrl(val);
                          const parsed = parseCoordinatesFromUrl(val);
                          if (parsed) {
                            setLatitude(parsed.lat);
                            setLongitude(parsed.lng);
                            setMapCenter(parsed);
                          }
                        }}
                        placeholder={language === 'en' ? "https://maps.app.goo.gl/... or latitude,longitude" : "https://maps.app.goo.gl/... या अक्षांश,देशांतर"}
                        className="w-full rounded-xl border border-stone-200 bg-white py-2.5 px-4 text-xs font-medium focus:border-emerald-800 focus:outline-hidden font-mono text-[11px]"
                      />
                      <p className="text-[10px] text-stone-500 leading-normal">
                        {language === 'en' 
                          ? "Paste index share map URL or custom coordinates (e.g., 21.2512,81.6296) to align the therapist dispatch." 
                          : "थेरेपिस्ट प्रेषण को संरेखित करने के लिए अपना साझा मैप यूआरएल या कस्टम निर्देशांक (जैसे, 21.2512, 81.6296) पेस्ट करें।"}
                      </p>
                    </div>

                    {/* Interactive Google Map Pinning */}
                    <div className="space-y-2 mt-3 pt-3 border-t border-stone-200/50">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                          📍 {language === 'en' ? 'Pin Draggable GPS Location' : 'जीपीएस लोकेशन मैप पिन करें'}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                  const lat = pos.coords.latitude;
                                  const lng = pos.coords.longitude;
                                  setLatitude(lat);
                                  setLongitude(lng);
                                  setMapCenter({ lat, lng });
                                  setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
                                },
                                (err) => {
                                  console.error("Browser geolocation blocked or unavailable:", err);
                                  // Quietly ignore or fall back
                                }
                              );
                            }
                          }}
                          className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1"
                        >
                          🎯 {language === 'en' ? 'Use Device GPS' : 'डिवाइस जीपीएस उपयोग करें'}
                        </button>
                      </div>

                      {hasValidKey && !isMapAuthFailed ? (
                        <div className="rounded-2xl overflow-hidden border border-stone-200 relative">
                          <APIProvider apiKey={API_KEY} version="weekly">
                            <Map
                              center={mapCenter}
                              zoom={mapZoom}
                              onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
                              onZoomChanged={(ev) => setMapZoom(ev.detail.zoom)}
                              mapId="DEMO_MAP_ID"
                              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                              style={{ width: '100%', height: '180px' }}
                              onClick={(e) => {
                                if (e.detail && e.detail.latLng) {
                                  const coords = e.detail.latLng;
                                  setLatitude(coords.lat);
                                  setLongitude(coords.lng);
                                  setGoogleMapsUrl(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`);
                                } else if ((e as any).latLng) {
                                  const lat = typeof (e as any).latLng.lat === 'function' ? (e as any).latLng.lat() : (e as any).latLng.lat;
                                  const lng = typeof (e as any).latLng.lng === 'function' ? (e as any).latLng.lng() : (e as any).latLng.lng;
                                  setLatitude(lat);
                                  setLongitude(lng);
                                  setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
                                }
                              }}
                            >
                              {latitude !== null && longitude !== null && (
                                <AdvancedMarker
                                  position={{ lat: latitude, lng: longitude }}
                                  draggable={true}
                                  onDragEnd={(e) => {
                                    if (e.latLng) {
                                      const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
                                      const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
                                      setLatitude(lat);
                                      setLongitude(lng);
                                      setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
                                    }
                                  }}
                                >
                                  <Pin background="#047857" borderColor="#065f46" glyphColor="#fff" />
                                </AdvancedMarker>
                              )}
                            </Map>
                          </APIProvider>
                          <div className="absolute bottom-2 left-2 right-2 bg-stone-900/85 backdrop-blur-xs text-stone-50 text-[9px] py-1 px-2 rounded-lg font-mono flex items-center justify-between">
                            <span>{language === 'en' ? '⚠️ Click Map or drag pin to adjust your exact house address' : '⚠️ सटीक पते के लिए मैप पर क्लिक करें या पिन खींचें'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-stone-50 border border-dashed border-amber-200 rounded-2xl p-4 text-center space-y-2.5">
                          <p className="text-[11px] text-stone-605 max-w-sm mx-auto leading-relaxed">
                            {isMapAuthFailed 
                              ? (language === 'en' 
                                  ? "⚠️ Interactive Map service is currently restricted due to billing constraints on the Google Maps custom API Key (BillingNotEnabledMapError). Rest assured, your coordinate inputs are saved perfectly." 
                                  : "⚠️ गूगल मैप्स कस्टम एपीआई की पर बिलिंग सीमा के कारण इंटरैक्टिव मैप सेवा अस्थायी रूप से अनुपलब्ध है (BillingNotEnabledMapError)। आश्वस्त रहें, आपके निर्देशांक सही ढंग से सहेजे गए हैं।")
                              : (language === 'en'
                                  ? "Setup an interactive Google Map to pin your exact house on the therapist’s map."
                                  : "थेरेपिस्ट के मानचित्र पर अपने सटीक घर को पिन करने के लिए गूगल मैप सक्रिय करें।")}
                          </p>
                          {isMapAuthFailed ? (
                            <div className="text-[10px] bg-amber-50 text-amber-900 px-3 py-2 rounded-xl border border-amber-100 text-left space-y-1">
                              <strong>How to resolve this as administrator:</strong>
                              <p className="leading-normal">
                                Link a valid Google Cloud Billing Account to your API project in Google Developer Console to restore live geospatial rendering overlays immediately.
                              </p>
                            </div>
                          ) : (
                            <div className="inline-block bg-amber-50 border border-amber-200 text-[#a16207] text-[10px] font-medium px-2.5 py-1.5 rounded-lg text-left leading-relaxed">
                              <strong>To add your API key:</strong>
                              <ol className="list-decimal pl-4 mt-0.5 space-y-0.5 text-[9.5px]">
                                <li>Get an API key from Google Cloud Console</li>
                                <li>Open <strong>Settings</strong> (⚙️ gear icon, top-right) → <strong>Secrets</strong></li>
                                <li>Add secret: name <code>GOOGLE_MAPS_PLATFORM_KEY</code>, paste your API key as the value</li>
                              </ol>
                            </div>
                          )}
                        </div>
                      )}

                      {latitude !== null && longitude !== null && (
                        <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-2.5 flex items-center justify-between gap-1 text-[10.5px]">
                          <span className="font-mono text-stone-600">
                            Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                          </span>
                          <span className="text-[9.5px] bg-[#047857]/10 text-[#047857] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                            {language === 'en' ? 'GPS Pinned' : 'मैप पिन सुरक्षित'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Area warning check */}
                    <div className="flex items-start space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="area-accept"
                        required
                        checked={areaAccepted}
                        onChange={(e) => setAreaAccepted(e.target.checked)}
                        className="h-4 w-4 text-emerald-805 border-stone-300 rounded-xs focus:ring-emerald-800 mt-0.5 cursor-pointer"
                      />
                      <label htmlFor="area-accept" className="text-[10px] text-stone-500 leading-tight select-none cursor-pointer">
                        {language === 'en'
                          ? 'I confirm that the therapist home visit address is located strictly within Raipur, Bhilai, or Durg metropolitan areas.'
                          : 'मैं पुष्टि करता/करती हूँ कि थेरेपिस्ट विजिट का आवासीय पता केवल रायपुर, भिलाई या दुर्ग महानगरीय क्षेत्र के भीतर ही स्थित है।'}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Consultation Context */}
              {selectedService.category === 'consultation' && (
                <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-200/40 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#2E7D32] font-bold block">
                    💬 {language === 'en' ? 'Clinical Assessment Parameters' : 'नैदानिक मूल्यांकन प्राथमिकताएं'}
                  </span>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        {language === 'en' ? "Baby's Age (Weeks)" : 'शिशु की आयु (सप्ताह में)'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={52}
                        placeholder="e.g. 4"
                        value={babyAgeWeeks}
                        onChange={(e) => setBabyAgeWeeks(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-white py-2.5 px-3 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        {language === 'en' ? 'Primary Focus of consultation *' : 'परामर्श का मुख्य ध्यान क्षेत्र *'}
                      </label>
                      <select
                        required
                        value={focusArea}
                        onChange={(e) => setFocusArea(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-white py-2.5 px-3 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                      >
                        <option value="">-- {language === 'en' ? 'Choose Core Area' : 'मुख्य समस्या चुनें'} --</option>
                        {selectedService.id === 'lactation-consult' ? (
                          <>
                            <option value="breast-pain">{language === 'en' ? 'Latching Pain / Sore Nipples' : 'स्तनपान के समय दर्द / सोर निपल्स'}</option>
                            <option value="low-supply">{language === 'en' ? 'Low Milk Supply Concerns' : 'दूध की कम आपूर्ति की चिंता'}</option>
                            <option value="holding-postures">{language === 'en' ? 'Correct Holding Postures' : 'सही मुद्रा और पोजीशन प्रशिक्षण'}</option>
                            <option value="pump-guideline">{language === 'en' ? 'Breast Pump Guidelines / Storing' : 'ब्रेस्ट पंप का उपयोग और दूध का भंडारण'}</option>
                          </>
                        ) : (
                          <>
                            <option value="baby-blues">{language === 'en' ? 'Postpartum Baby Blues / Mood swings' : 'प्रसवोत्तर उदासी (Baby Blues) / मूड में बदलाव'}</option>
                            <option value="sleep-exhaustion">{language === 'en' ? 'Sleep Deprivation & Extreme Fatigue' : 'नींद की कमी और अत्यधिक थकान'}</option>
                            <option value="anxiety-worry">{language === 'en' ? 'Anxiety & Baby Safety Hyper-vigilance' : 'शिशु सुरक्षा संबंधी चिंता व घबराहट'}</option>
                            <option value="adjustment">{language === 'en' ? 'Adjusting to New Maternal Identity' : 'नए मातृत्व दायित्वों के समन्वय में सहायता'}</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  {language === 'en' ? 'Somatic physical notes (e.g. C-section wounds, breast heaviness, colic)' : 'विशेष नोट (जैसे सिजेरियन टांके का दर्द, बच्चे की पेट गैस आदि)'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'en' ? "Tell us details that help our specialist deliver comforting therapy..." : "विशेषज्ञ दाई के सुलभ मार्गदर्शन हेतु विवरण साझा करें..."}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/40 py-2 px-3 text-xs font-medium focus:border-emerald-800 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 text-xs text-stone-600 space-y-1">
                  <span className="font-semibold text-emerald-950 block">
                    {language === 'en' ? 'Appointment Snapshot:' : 'सत्र विवरण संक्षेप:'}
                  </span>
                  <div className="flex justify-between font-mono text-[10.5px]">
                    <span>{language === 'en' ? 'Treatment:' : 'उपचार पैकेज:'} <strong>{language === 'en' ? selectedService.name : selectedService.nameHindi}</strong></span>
                    <span>Fee: ₹{selectedService.priceInr.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10.5px]">
                    <span>{language === 'en' ? 'Session Timing:' : 'सत्र समयसीमा:'} <strong>{selectedDate} @ {selectedSlot}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="rounded-full border border-stone-200 hover:bg-stone-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-600 transition cursor-pointer flex-1"
                >
                  {language === 'en' ? 'Go Back' : 'पीछे जाएँ'}
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-stone-50 px-6 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex-1"
                >
                  {language === 'en' ? 'Confirm Care Booking' : 'बुकिंग कन्फर्म करें'}
                </button>
              </div>
            </form>
          )}

          {/* SUCCESS MESSAGE STEP */}
          {step === 'success' && createdBooking && (
            <div className="text-center py-8 space-y-6" id="wizard-success-state">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                <CheckCircle className="h-10 w-10 animate-pulse text-emerald-850" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-2xl font-bold text-stone-900">
                  {language === 'en' ? 'Holistic Care Session Reserved!' : 'बुकिंग सफलतापूर्वक सुरक्षित की गई!'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  {language === 'en' 
                    ? <>Your appointment ID is <strong className="font-mono text-emerald-900 uppercase">{createdBooking.id}</strong>. A clinical coordinator will telephone the mother at <strong>{phone}</strong> inside the next 2 hours.</>
                    : <>आपकी अपॉइंटमेंट आईडी <strong className="font-mono text-emerald-900 uppercase">{createdBooking.id}</strong> है। मातृ समन्वय विभाग से जल्द ही आपसे <strong>{phone}</strong> पर अगले २ घंटे में संपर्क किया जाएगा।</>}
                </p>
              </div>

              {/* Comprehensive snapshot */}
              <div className="border border-stone-200 rounded-3xl p-5 bg-stone-50 max-w-md mx-auto text-left space-y-3.5">
                <span className="block font-serif text-sm font-bold text-stone-900 border-b border-light-200 pb-2">
                  {language === 'en' ? 'Care Session Receipt' : 'बुकिंग रसीद विवरण'}
                </span>
                
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="block text-stone-400 font-mono uppercase tracking-widest text-[9px]">
                      {language === 'en' ? 'Mother Name' : 'माता का नाम'}
                    </span>
                    <span className="font-bold text-stone-800 text-xs">{createdBooking.userDetails?.motherName}</span>
                  </div>
                  <div>
                    <span className="block text-stone-400 font-mono uppercase tracking-widest text-[9px]">
                      {language === 'en' ? 'Baby Name' : 'शिशु का नाम'}
                    </span>
                    <span className="font-bold text-stone-800 text-xs">{createdBooking.userDetails?.babyName || (language === 'en' ? 'Not Born' : 'शीघ्र ही')}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-stone-400 font-mono uppercase tracking-widest text-[9px]">
                      {language === 'en' ? 'Care Treatment Program' : 'उपचार सत्र पैकेज'}
                    </span>
                    <span className="font-bold text-stone-800 text-xs">
                      {language === 'en' ? (createdBooking.serviceName || createdBooking.service?.name) : (createdBooking.service?.nameHindi || createdBooking.serviceName)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-stone-400 font-mono uppercase tracking-widest text-[9px]">
                      {language === 'en' ? 'Support Coordinators' : 'सहायता टीम विवरण'}
                    </span>
                    <span className="font-bold text-stone-800 text-xs">{language === 'en' ? 'MaatriSparsh Support Team' : 'मातृस्पर्श टीम'}</span>
                  </div>
                  <div>
                    <span className="block text-stone-400 font-mono uppercase tracking-widest text-[9px]">
                      {language === 'en' ? 'Date & Session Hour' : 'तिथि और समय स्लॉट'}
                    </span>
                    <span className="font-bold text-stone-800 text-xs">{createdBooking.date} @ {createdBooking.timeSlot}</span>
                  </div>
                </div>

                <div className="border-t border-stone-200/50 pt-2 flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-stone-505 font-mono">
                    {language === 'en' ? 'Net Consultation Fee:' : 'कुल परामर्श शुल्क:'}
                  </span>
                  <span className="font-serif font-black text-lg text-emerald-850 bg-white/70 px-2.5 py-1 rounded border border-stone-200/50">
                    ₹{(createdBooking.service?.priceInr || selectedService?.priceInr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Confirmation Receipt Dispatch */}
              <div className="bg-[#e8f5e9]/70 border border-[#c8e6c9] rounded-2xl p-4 space-y-2.5 text-left text-xs text-stone-750 max-w-md mx-auto">
                <span className="font-semibold text-emerald-950 flex items-center gap-1.5 font-sans">
                  <svg className="h-4.5 w-4.5 text-[#25d366] fill-currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.004 0C5.378 0 .002 5.376.002 12c0 2.112.551 4.17 1.597 5.979L.002 24l6.195-1.623c1.737.947 3.693 1.447 5.807 1.447 6.623 0 11.996-5.377 11.996-12S18.627 0 12.004 0zm0 21.993c-1.897 0-3.754-.51-5.385-1.472l-.386-.23-3.664.96.977-3.57-.253-.401a9.923 9.923 0 0 1-1.523-5.28c0-5.467 4.453-9.919 9.92-9.919 2.651 0 5.143 1.033 7.02 2.91 1.876 1.877 2.909 4.37 2.909 7.01s-1.033 5.143-2.91 7.02c-1.876 1.876-4.37 2.911-7.008 2.911zm5.348-7.306c-.292-.146-1.729-.854-1.996-.951-.267-.098-.462-.147-.657.146-.195.293-.756.952-.927 1.147-.171.195-.341.219-.633.073-.292-.146-1.233-.454-2.348-1.45-.869-.775-1.455-1.733-1.729-2.025-.27-.293-.028-.45.118-.596.133-.131.293-.341.439-.512.146-.171.195-.293.292-.488.098-.195.049-.366-.024-.512-.073-.146-.657-1.585-.901-2.172-.238-.57-.482-.493-.659-.502-.17-.008-.365-.008-.56-.008s-.512.073-.78.366c-.267.293-1.023.999-1.023 2.437s1.048 2.827 1.194 3.022c.146.195 2.062 3.15 4.996 4.413.984.423 1.776.626 2.392.821.987.313 1.887.269 2.597.163.791-.118 1.729-.708 1.973-1.356.244-.648.244-1.204.171-1.32-.074-.117-.269-.191-.561-.337z" fill="currentColor"/>
                  </svg>
                  <span className="font-semibold text-emerald-950 flex items-center gap-1.5 font-sans text-xs">
                    {language === 'en' ? 'Get Instant WhatsApp Receipt' : 'तुरंत व्हाट्सएप (WhatsApp) विवरण साझा करें'}
                  </span>
                </span>
                <p className="text-stone-605 text-[11.5px] leading-relaxed">
                  {language === 'en' 
                    ? <>Receive your official care reservation receipt and specialist guidelines directly on WhatsApp for secure reference.</>
                    : <>सुरक्षित संदर्भ के लिए सीधे व्हाट्सएप पर अपनी आधिकारिक देखभाल रसीद और विशेषज्ञ दिशानिर्देश प्राप्त करें।</>}
                </p>

                <a
                  href={`https://wa.me/${formatWhatsAppNumber(phone)}?text=${encodeURIComponent(
                    language === 'en'
                      ? `*🌸 Hello ${createdBooking.userDetails?.motherName || 'Verified Mother'} 🌸*\n\nYour postpartum wellness & healing session with *MaatriSparsh Care* is compiled successfully! Here is your official Care Receipt:\n\n*📌 Booking Reference ID:* ${createdBooking.id}\n*💆‍♀️ Therapy Package:* ${createdBooking.serviceName || createdBooking.service?.name}\n*📅 Session Date:* ${createdBooking.date}\n*⏰ Selected Hour:* ${createdBooking.timeSlot}\n*🛋️ Treatment Range:* Raipur & Bhilai Home Visit Specialities\n*💰 Net consultation Fee:* ₹${(createdBooking.service?.priceInr || selectedService?.priceInr || 0)} (Payable upon therapist arrival)\n\nOur leading postpartum therapy coordinator will initiate WhatsApp coordination with you within 2 hours to confirm therapist arrival, logistics and preparation instructions.\n\nWarm regards,\n_MaatriSparsh Postpartum Care Sanctum_`
                      : `*🌸 नमस्ते ${createdBooking.userDetails?.motherName || 'Verified Mother'} 🌸*\n\n*मातृस्पर्श केयर (MaatriSparsh Care)* के साथ आपका मातृत्व कल्याण और थेरेपी सत्र सफलतापूर्वक सुरक्षित हो चुका है! आपकी रसीद नीचे दी गई है:\n\n*📌 बुकिंग आईडी:* ${createdBooking.id}\n*💆‍♀️ सेवा पैकेज:* ${createdBooking.service?.nameHindi || createdBooking.service?.name}\n*📅 अपॉइंटमेंट तिथि:* ${createdBooking.date}\n*⏰ समय स्लॉट:* ${createdBooking.timeSlot}\n*🛋️ सेवा क्षेत्र:* रायपुर और भिलाई होम विजिट\n*💰 शुल्क:* ₹${(createdBooking.service?.priceInr || selectedService?.priceInr || 0)}\n\nमातृ समन्वय विभाग से थेरेपिस्ट आगमन की तैयारी के लिए आपसे शीघ्र ही संपर्क किया जाएगा। मातृत्व कल्याण यात्रा में आपका स्वागत है।\n\nसादर,\n_मातृस्पर्श टीम_`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full font-bold bg-[#128c7e] hover:bg-[#075e54] text-white px-4 py-2.5 rounded-xl shadow-xs transition-all text-xs cursor-pointer text-center"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.455L0 24zm6.09-3.957l.328.195c1.611.957 3.655 1.463 5.726 1.464 5.764 0 10.455-4.683 10.459-10.448.002-2.793-1.082-5.421-3.053-7.393C17.64 2.29 15.019 1.198 12.23 1.198c-5.776 0-10.473 4.692-10.477 10.46-.001 2.059.537 4.07 1.558 5.867l.215.378-.999 3.65 3.73-.977zm12.38-5.344c-.303-.151-1.793-.884-2.073-.984-.279-.101-.482-.151-.684.152-.201.302-.777.984-.954 1.185-.176.202-.353.226-.656.075-.303-.151-1.278-.471-2.435-1.503-.9-.802-1.507-1.793-1.793-2.095-.286-.301-.03-.464.121-.614.136-.134.303-.352.454-.528.151-.176.202-.302.302-.503.101-.201.05-.378-.025-.529-.075-.152-.684-1.65-.937-2.259-.247-.595-.5-.515-.684-.524-.176-.008-.378-.01-.58-.01s-.529.076-.807.378c-.279.302-1.062 1.037-1.062 2.529 0 1.491 1.087 2.932 1.238 3.133.151.201 2.138 3.264 5.178 4.57 1.018.437 1.838.647 2.476.85 1.022.324 1.954.278 2.689.168.819-.122 1.793-.733 2.046-1.41.252-.676.252-1.258.176-1.382-.076-.123-.279-.2-.582-.351z"/>
                  </svg>
                  <span>{language === 'en' ? 'Open WhatsApp Confirmation Link' : 'व्हाट्सएप चैट पर रसीद प्राप्त करें'}</span>
                </a>
              </div>

              {/* Live Email Confirmation Status & Interactive Native Fallback Trigger */}
              {sendEmailConfirm && (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-2.5 text-left text-xs text-stone-750 max-w-md mx-auto">
                  <span className="font-semibold text-emerald-950 flex items-center gap-1.5 font-sans">
                    📧 {language === 'en' ? 'Email Dispatch Active' : 'ईमेल पुष्टिकरण सक्रिय'}
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                  </span>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {language === 'en' 
                      ? <>Your booking confirmation email was initiated and scheduled for dispatch to <strong>{createdBooking.email}</strong> dynamically.</>
                      : <>सत्र पुष्टिकरण और रसीद विवरण आपके ईमेल <strong>{createdBooking.email}</strong> पर भेजने की प्रक्रिया आरंभ कर दी गई है।</>}
                  </p>
                  
                  {(!(import.meta as any).env?.VITE_RESEND_API_KEY && !(import.meta as any).env?.VITE_EMAILJS_SERVICE_ID) && (
                    <div className="pt-2 border-t border-emerald-200/40 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[9.5px]">
                        <span className="text-amber-850 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                          ⚠️ {language === 'en' ? 'SMTP or Resend API key is missing' : 'एसएमटीपी या रीसेंड एपीआई की दर्ज नहीं है'}
                        </span>
                      </div>
                      <a
                        href={`mailto:${createdBooking.email}?subject=${encodeURIComponent(`[MaatriSparsh Care] Your Postnatal Care Booking Confirmation (${createdBooking.id})`)}&body=${encodeURIComponent(
                          `Dear ${createdBooking.userDetails?.motherName || 'Verified Mother'},\n\nWe are delighted to confirm your postnatal / postpartum therapeutic care package reservation with MaatriSparsh Care!\n\n=================== BOOKING DETAILS ===================\nBooking Reference ID: ${createdBooking.id}\nTreatment Session: ${createdBooking.serviceName || createdBooking.service?.name}\nAppointment Scheduled: ${createdBooking.date} at ${createdBooking.timeSlot}\nAssigned Associate Specialist: ${createdBooking.practitionerName || createdBooking.practitioner?.name || 'MaatriSparsh Specialist Coordinator'}\nLocation Range: Raipur, Bhilai & Durg Metro Areas\n====================================================\n\nOur head clinical postpartum care coordinator will initiate whatsapp coordination with you within 2 hours to confirm therapist arrival, logistics and preparation instructions.\n\nWarm regards,\nMaatriSparsh Postpartum Care Sanctum Team\nhttps://maatrisparsh.com\nContact: +91 9183216100`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 font-bold bg-amber-550/10 hover:bg-amber-550/20 text-amber-950 border border-amber-200 px-3 py-1.5 rounded-xl transition-all text-[10px] cursor-pointer"
                      >
                        📬 {language === 'en' ? 'Send Directly via Your Email App (Gmail/Outlook)' : 'सीधे अपने ईमेल ऐप द्वारा भेजें (जीमेल/आउटलुक)'}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 max-w-xs mx-auto">
                <button
                  onClick={onClose}
                  className="w-full rounded-full bg-emerald-800 hover:bg-emerald-900 text-stone-50 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Return to Sanctum' : 'केंद्र मुख्य पृष्ठ पर जाएं'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Back/Next controls (only when not on final success/details/or first page) */}
        {step !== 'success' && step !== 'details' && (
          <div className="bg-stone-50 border-t border-stone-100 px-6 py-4 flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={step === 'service'}
              className="rounded-full border border-stone-200 bg-white hover:bg-stone-100 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-605 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{language === 'en' ? 'Back' : 'पीछे'}</span>
            </button>
            <button
              onClick={handleNextStep}
              className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-stone-50 px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
            >
              <span>{language === 'en' ? 'Continue' : 'आगे बढ़ें'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
