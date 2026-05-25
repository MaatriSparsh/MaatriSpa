import { useState } from 'react';
import { Menu, X, Calendar, User, LogOut, BookOpen, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from './FirebaseProvider';
import { useLanguage } from './LanguageProvider';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onOpenAdminPortal?: () => void;
  bookingCount: number;
}

// Beautiful customized vector logo representing the gold letter "M" forming a heart
// containing a mother-infant silhouette and a gold health plus, on a soft pink circle back
export function ElegantLogo() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1F2] border border-rose-100 shadow-xs shrink-0" id="brand-emblem-badge">
      <svg viewBox="0 0 100 100" className="h-10 w-10 overflow-visible shrink-0" id="logo-emblem-svg">
        {/* Soft pink heart background fill inside the logo */}
        <path 
          d="M50 82C50 82 18 55 18 35C18 21 27 12 39 12C46 12 48 17 50 22C52 17 54 12 61 12C73 12 82 21 82 35C82 55 50 82 50 82Z" 
          fill="#FFE4E6" 
          opacity="0.9" 
        />
        {/* Golden outer letter "M" whose center dipping curve forms the inner heart boundary */}
        <path 
          d="M22 75 L22 25 C22 17 29 13 35 18 C41 24 45 32 50 38 C55 32 59 24 65 18 C71 13 78 17 78 25 L78 75" 
          stroke="#ca8a04" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
        {/* Mother silhouette kissing child in gold */}
        <path 
          d="M44 46C41 41 46 33 50 33C54 33 56 37 54 42C52 47 45 49 44 46Z" 
          fill="#a16207" 
        />
        <path 
          d="M40 52C37 57 32 63 35 73C38 78 48 83 55 77C57 73 54 66 50 64C46 62 43 56 40 52Z" 
          fill="#a16207" 
        />
        {/* Child silhouette and plus symbol */}
        <circle cx="58" cy="58" r="4.5" fill="#ca8a04" />
        <path d="M54 64C56 68 62 72 65 67" stroke="#ca8a04" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Health Plus Symbol */}
        <path d="M72 26 H82 M77 21 V31" stroke="#ca8a04" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function Header({ activeTab, setActiveTab, onOpenBooking, onOpenAuth, onOpenDashboard, onOpenAdminPortal, bookingCount }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile, isAdmin, logOut, bookings } = useFirebase();
  const { language, setLanguage, t } = useLanguage();

  const displayBookingCount = user ? bookings.length : bookingCount;

  const navItems = [
    { id: 'home', label: t.tabHome },
    { id: 'about', label: t.tabAbout },
    { id: 'services', label: t.tabServices },
    { id: 'testimonials', label: t.tabTestimonials },
    { id: 'contact', label: t.tabContact },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand Title representing postpartum and newborn protection */}
        <div 
          className="flex cursor-pointer items-center space-x-3" 
          onClick={() => setActiveTab('home')}
          id="brand-logo"
        >
          <ElegantLogo />
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 leading-none block">
              Maatri<span className="text-emerald-800 font-serif">Sparsh</span>
            </span>
            <span className="block text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-[#a16207] -mt-0.5 font-bold">
              {language === 'en' ? 'Postnatal & Newborn Sanctum' : 'प्रसवोत्तर और नवजात शिशु कल्याण केंद्र'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-7" id="desktop-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative py-2 text-xs lg:text-sm font-medium transition-all duration-200 cursor-pointer hover:text-emerald-800 ${
                activeTab === item.id ? 'text-emerald-800 font-bold' : 'text-stone-600'
               }`}
            >
              {item.label}
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-850"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Calendar, Book Now, and Auth Actions Header Shortcut */}
        <div className="hidden md:flex items-center space-x-3">
          
          {/* Real-time Language translation switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-stone-250 bg-stone-100 hover:bg-stone-200 hover:border-emerald-700 text-xs font-semibold uppercase tracking-wider text-stone-705 transition cursor-pointer"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
            <span className="font-mono text-[10px]">{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-2.5" id="header-user-menu">
              {isAdmin && (
                <button
                  onClick={onOpenAdminPortal}
                  className="flex items-center space-x-1.5 rounded-full border border-emerald-400 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-800 transition cursor-pointer"
                >
                  <span>Admin</span>
                </button>
              )}
              {/* Mother dashboard shortcuts */}
              <button
                onClick={onOpenDashboard}
                className="flex items-center space-x-1.5 rounded-full border border-stone-200 hover:bg-stone-105 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 transition cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                <span>{t.myCare} ({displayBookingCount})</span>
              </button>

              <button
                onClick={onOpenBooking}
                className="group relative flex items-center space-x-1.5 overflow-hidden rounded-full bg-emerald-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-50 transition-all duration-300 hover:bg-emerald-900 shadow-xs active:scale-95 cursor-pointer"
                id="book-btn-desktop"
              >
                <Calendar className="h-3.5 w-3.5 text-rose-200 group-hover:scale-105 transition-transform" />
                <span>{t.bookSlot}</span>
              </button>

              <button
                onClick={() => logOut()}
                className="rounded-full hover:bg-stone-200/50 p-2 text-stone-500 hover:text-stone-850 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5" id="header-auth-triggers">
              <button
                onClick={onOpenAuth}
                className="rounded-full border border-stone-200 text-stone-700 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition cursor-pointer flex items-center space-x-1.5"
              >
                <User className="h-3.5 w-3.5 text-stone-500" />
                <span>{t.memberAccess}</span>
              </button>

              <button
                onClick={onOpenBooking}
                className="group relative flex items-center space-x-1.5 overflow-hidden rounded-full bg-emerald-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-50 transition-all duration-300 hover:bg-emerald-900 shadow-xs active:scale-95 cursor-pointer"
                id="book-btn-desktop"
              >
                <Calendar className="h-3.5 w-3.5 text-rose-200 group-hover:scale-105 transition-transform" />
                <span>{t.bookSlot}</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Trigger Buttons */}
        <div className="flex items-center space-x-2.5 md:hidden">
          {/* Mobile Language translation switcher */}
          <button
            onClick={toggleLanguage}
            className="p-2 text-emerald-800 hover:bg-stone-200/50 rounded-full transition-colors cursor-pointer"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="h-5 w-5" />
          </button>

          {/* Mobile Booking Trigger Shortcut */}
          <button
            onClick={onOpenBooking}
            className="relative p-2 text-emerald-800 hover:bg-stone-200/50 rounded-full transition-colors cursor-pointer"
            aria-label="Bookings"
          >
            <Calendar className="h-5 w-5" />
            {displayBookingCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-stone-950 leading-none">
                {displayBookingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 transition-colors cursor-pointer"
            id="mobile-nav-toggle"
          >
            {isOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="border-b border-stone-200 bg-stone-50 md:hidden overflow-hidden"
            id="mobile-menu-drawer"
          >
            <div className="space-y-1 px-4 pt-2 pb-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-emerald-50 text-emerald-950 border-l-4 border-emerald-800'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Mobile Auth and Dashboard triggers */}
              <div className="pt-3 border-t border-stone-200 space-y-2 px-2">
                {user ? (
                  <>
                    <div className="text-xs text-stone-500 font-mono py-1">
                      👤 {language === 'en' ? 'Hello' : 'नमस्ते'}, {userProfile?.motherName || 'Verified Member'}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onOpenAdminPortal?.();
                        }}
                        className="flex w-full items-center justify-center space-x-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-800 hover:bg-rose-100 cursor-pointer mb-2"
                      >
                        <span>{language === 'en' ? 'Admin Portal' : 'एडमिन पोर्टल'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenDashboard();
                      }}
                      className="flex w-full items-center justify-center space-x-2 rounded-xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                    >
                      <BookOpen className="h-4.5 w-4.5 text-emerald-800" />
                      <span>{t.myCare} ({displayBookingCount})</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        logOut();
                      }}
                      className="flex w-full items-center justify-center space-x-2 rounded-xl border border-rose-200 bg-rose-50/50 py-3 text-sm font-semibold text-stone-700 hover:bg-rose-100 cursor-pointer"
                    >
                      <LogOut className="h-4.5 w-4.5 text-rose-750" />
                      <span>{language === 'en' ? 'Sign Out' : 'लॉग आउट'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAuth();
                    }}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    <User className="h-4.5 w-4.5 text-stone-500" />
                    <span>{t.memberAccess}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenBooking();
                  }}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-emerald-800 py-3 text-sm font-bold uppercase tracking-wider text-stone-50 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <Calendar className="h-4.5 w-4.5 text-rose-200" />
                  <span>{t.bookSlot}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
