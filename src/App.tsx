import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingSocial from './components/FloatingSocial';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import ServicesView from './components/ServicesView';
import ContactView from './components/ContactView';
import TestimonialsView from './components/TestimonialsView';
import BookingWizard from './components/BookingWizard';
import AuthModal from './components/AuthModal';
import MyBookingsModal from './components/MyBookingsModal';
import AdminPortalModal from './components/AdminPortalModal';
import EmailVerificationPending from './components/EmailVerificationPending';
import { Booking } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { TicketCheck, Flower2 } from 'lucide-react';
import { useFirebase } from './components/FirebaseProvider';
import { useLanguage } from './components/LanguageProvider';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [shouldOpenBookingAfterAuth, setShouldOpenBookingAfterAuth] = useState<boolean>(false);
  const [bookingCount, setBookingCount] = useState<number>(0);

  // New Alert notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { user, userProfile, bookings } = useFirebase();
  const { t, language } = useLanguage();

  const isEmailUser = user?.providerData.some((p) => p.providerId === 'password');
  const isPendingVerification = !!(user && isEmailUser && !user.emailVerified && !userProfile?.isVerified);

  // Keep static and dynamic sync of booking count
  useEffect(() => {
    if (user) {
      setBookingCount(bookings.length);
    } else {
      const saved = localStorage.getItem('maatrisparsh_bookings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Booking[];
          if (Array.isArray(parsed)) {
            setBookingCount(parsed.length);
          }
        } catch (err) {
          setBookingCount(0);
        }
      } else {
        setBookingCount(0);
      }
    }
  }, [user, bookings]);

  // Update tally and trigger micro-toast on successful scheduling
  const handleBookingSuccess = (newBooking: Booking) => {
    const srvName = language === 'en' ? newBooking.service.name : newBooking.service.nameHindi;
    setToastMessage(
      language === 'en'
        ? `Successfully Booked: "${srvName}" is scheduled on ${newBooking.date} with ${newBooking.practitioner.name}.`
        : `बुकिंग सफल: "${srvName}" को ${newBooking.date} को ${newBooking.practitioner.name} के साथ तय किया गया है।`
    );
    
    // Auto remove toast after 7.5 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 7500);
  };

  const handleOpenBookingWithService = (serviceId: string) => {
    if (isPendingVerification) {
      setToastMessage(
        language === 'en'
          ? 'Kindly verify your email before scheduling services.'
          : 'कृपया सेवाएं बुक करने से पहले अपना ईमेल सत्यापित करें।'
      );
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }
    if (!user) {
      setToastMessage(
        language === 'en'
          ? 'To protect postpartum records, kindly sign in or create a profile before scheduling.'
          : 'सुरक्षा हेतु, बुकिंग फॉर्म भरने से पहले कृपया साइन इन करें या अपनी विवरणी बनाएँ।'
      );
      setTimeout(() => setToastMessage(null), 5000);
      setSelectedServiceId(serviceId);
      setShouldOpenBookingAfterAuth(true);
      setIsAuthOpen(true);
      return;
    }
    setSelectedServiceId(serviceId);
    setIsBookingOpen(true);
  };

  const handleOpenGeneralBooking = () => {
    if (isPendingVerification) {
      setToastMessage(
        language === 'en'
          ? 'Kindly verify your email before scheduling.'
          : 'कृपया सत्र बुक करने से पहले अपना ईमेल सत्यापित करें।'
      );
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }
    if (!user) {
      setToastMessage(
        language === 'en'
          ? 'To protect postpartum records, kindly sign in or create a profile before scheduling.'
          : 'सुरक्षा हेतु, बुकिंग फॉर्म भरने से पहले कृपया साइन इन करें या अपनी विवरणी बनाएँ।'
      );
      setTimeout(() => setToastMessage(null), 5000);
      setSelectedServiceId(undefined);
      setShouldOpenBookingAfterAuth(true);
      setIsAuthOpen(true);
      return;
    }
    setSelectedServiceId(undefined);
    setIsBookingOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 font-sans antialiased text-stone-850" id="main-application-scaffolding">
      
      {/* Premium Notification Banner shortcut */}
      <div className="bg-emerald-950 px-4 py-2.5 text-center text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-[#FFF7F4] uppercase sm:px-6">
        {language === 'en'
          ? '✨ Traditional Postpartum Restoration (Sutika Snana) & Lactation classes • Certified Safe'
          : '✨ पारंपरिक प्रसवोत्तर सूतिका स्नेहन मालिश, स्तनपान कक्षाएं व नवजात सुरक्षा • १००% वैज्ञानिक व सुरक्षित'}
      </div>

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={handleOpenGeneralBooking}
        onOpenAuth={() => {
          setShouldOpenBookingAfterAuth(false);
          setIsAuthOpen(true);
        }}
        onOpenDashboard={() => {
          setIsDashboardOpen(true);
        }}
        onOpenAdminPortal={() => {
          setIsAdminPortalOpen(true);
        }}
        bookingCount={bookingCount}
      />

      {/* Elegant Infinite Running Alert Banner below Header */}
      <div className="relative w-full bg-amber-50/90 border-b border-amber-100/80 py-2 sm:py-2.5 overflow-hidden select-none" id="geofence-alert-banner">
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          
          {/* Static Area Badge */}
          <div className="flex items-center space-x-1.5 shrink-0 bg-amber-100 hover:bg-amber-200/85 text-amber-900 border border-amber-200/82 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-serif font-bold transition-all mr-4 z-10 shadow-xs">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-rose-600"></span>
            </span>
            <span className="tracking-wide">{language === 'en' ? 'Active Territory Only' : 'सक्रिय सेवा क्षेत्र'}</span>
          </div>

          {/* Marquee Track Container */}
          <div className="relative flex-1 overflow-hidden" id="marquee-scrolling-container">
            <motion.div
              className="flex whitespace-nowrap space-x-12 sm:space-x-16"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                ease: "linear",
                duration: 25,
                repeat: Infinity,
              }}
            >
              {/* Duplicate contents to make seamless infinite rotation */}
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="flex items-center space-x-12 sm:space-x-16 shrink-0">
                  <span className="text-xs sm:text-sm font-serif font-extrabold tracking-wide text-amber-950 flex items-center space-x-2">
                    <span>📍 {language === 'en' ? 'Only Available in Raipur-Bhilai-Durg' : 'केवल रायपुर - भिलाई - दुर्ग में सेवा उपलब्ध'}</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono text-stone-400 select-none font-medium uppercase tracking-widest block py-0.5 px-2 bg-stone-100 rounded-md">
                    {language === 'en' ? 'Exclusive Postnatal Sanctum' : 'पारंपरिक प्रसवोत्तर केंद्र'}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Success Toast Alert Panel */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-4 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 z-55 p-4 rounded-2xl bg-white border-2 border-emerald-800 shadow-xl max-w-lg"
          >
            <div className="flex items-start space-x-3.5">
              <div className="p-2 bg-emerald-50 rounded-full text-emerald-800 shrink-0">
                <TicketCheck className="h-5 w-5 text-emerald-800 animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="font-serif text-sm font-bold text-stone-900 block">
                  {language === 'en' ? 'Sutika Slot Confirmed!' : 'सत्र सफलतापूर्वक बुक हो गया!'}
                </span>
                <p className="text-xs text-stone-600 leading-relaxed">{toastMessage}</p>
                <div className="text-[10px] text-amber-700 font-mono uppercase tracking-widest pt-2.5 flex items-center space-x-1.5">
                  <Flower2 className="h-3.5 w-3.5 text-amber-500 animate-spin-slow" />
                  <span>
                    {language === 'en' 
                      ? 'MaatriSparsh Pediatric Liaison Will Call Within 2 Hours' 
                      : 'हमारे मातृत्व केंद्र से विशेषज्ञ आपसे अगले २ घंटे में संपर्क करेंगे'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Tabs Renderer with smooth layout fade-ins */}
      <main className="flex-1" id="main-content-flow">
        {isPendingVerification ? (
          <EmailVerificationPending />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && (
                <HomeView
                  onNavigateToTab={setActiveTab}
                  onOpenBookingWithService={handleOpenBookingWithService}
                />
              )}
              {activeTab === 'about' && <AboutView />}
              {activeTab === 'services' && (
                <ServicesView onOpenBookingWithService={handleOpenBookingWithService} />
              )}
              {activeTab === 'testimonials' && <TestimonialsView />}
              {activeTab === 'contact' && <ContactView />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer
        setActiveTab={setActiveTab}
        onOpenBooking={handleOpenGeneralBooking}
      />

      {/* Floating social links and WhatsApp widget */}
      <FloatingSocial />

      {/* Embedded Booking wizard and identity modals */}
      <AnimatePresence>
        {isBookingOpen && (
          <BookingWizard
            preselectedServiceId={selectedServiceId}
            onClose={() => setIsBookingOpen(false)}
            onBookingSuccess={handleBookingSuccess}
          />
        )}
        {isAuthOpen && (
          <AuthModal
            onClose={() => setIsAuthOpen(false)}
            onSuccess={() => {
              if (shouldOpenBookingAfterAuth) {
                const isEmail = user?.providerData.some((p) => p.providerId === 'password');
                const isPending = !!(user && isEmail && !user.emailVerified);
                if (isPending) {
                  setToastMessage(
                    language === 'en'
                      ? 'Registration successful! Verification link sent. Kindly verify your email from your inbox to book sessions.'
                      : 'पंजीकरण सफल! सत्यापन लिंक भेज दिया गया है। सत्र बुक करने के लिए कृपया अपना ईमेल सत्यापित करें।'
                  );
                  setTimeout(() => setToastMessage(null), 8000);
                } else {
                  setIsBookingOpen(true);
                }
                setShouldOpenBookingAfterAuth(false);
              }
            }}
          />
        )}
        {isDashboardOpen && (
          <MyBookingsModal
            onClose={() => setIsDashboardOpen(false)}
          />
        )}
        {isAdminPortalOpen && (
          <AdminPortalModal
            onClose={() => setIsAdminPortalOpen(false)}
            onOpenBookingWizard={() => {
              setIsAdminPortalOpen(false);
              setIsBookingOpen(true);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
