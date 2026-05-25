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

  const { user, bookings } = useFirebase();
  const { t, language } = useLanguage();

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
      <main className="flex-1">
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
                setIsBookingOpen(true);
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
