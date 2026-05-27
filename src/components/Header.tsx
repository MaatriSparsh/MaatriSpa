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
  const ringVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 1.5, ease: 'easeInOut' }
    }
  };

  const leafVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { duration: 1.4, ease: 'easeOut', delay: 0.4 }
    }
  };

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 120, 
        damping: 8, 
        delay: 1.0 + i * 0.15 
      }
    })
  };

  const containerVariants = {
    animate: {
      y: [0, -1.5, 0],
      transition: {
        duration: 5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse' as const
      }
    },
    hover: {
      scale: 1.06,
      filter: 'drop-shadow(0 0 10px rgba(223, 177, 91, 0.75))',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <motion.div 
      className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-stone-100/40 border border-stone-200/50 shadow-xs shrink-0 overflow-visible" 
      id="brand-emblem-badge"
      variants={containerVariants}
      animate="animate"
      whileHover="hover"
    >
      <svg viewBox="0 0 100 100" className="h-11 w-11 md:h-13 md:w-13 overflow-visible shrink-0" id="logo-emblem-svg" filter="url(#goldGlow)">
        <defs>
          <linearGradient id="maatriGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9B782F" />     {/* Deep warm gold shadow */}
            <stop offset="15%" stopColor="#FFE59E" />    {/* Bright golden highlight */}
            <stop offset="35%" stopColor="#DFB15B" />    {/* Classic middle gold */}
            <stop offset="50%" stopColor="#FFF9E5" />    {/* Shiny radiant light gold */}
            <stop offset="65%" stopColor="#C59B27" />    {/* Ayurvedic mustard gold */}
            <stop offset="85%" stopColor="#FFDE8A" />    {/* Soft secondary highlight */}
            <stop offset="100%" stopColor="#6E5212" />   {/* Deep antique bronze */}
          </linearGradient>
          
          {/* Subtle drop-shadow filter to give the golden logo 3D depth */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#6E5212" floodOpacity="0.32" />
          </filter>
        </defs>

        {/* 1. Circular Outer Ring with Gap at the top */}
        <motion.path 
          d="M 32 18.0 A 40 40 0 1 0 68 18.0" 
          stroke="url(#maatriGoldGradient)" 
          strokeWidth="3.5" 
          strokeLinecap="butt" 
          fill="none"
          variants={ringVariants}
          initial="hidden"
          animate="visible"
        />

        {/* 2. Three Crown Leaves in the Top Gap */}
        {/* Middle Leaf (Upright) */}
        <motion.path 
          d="M 50 15 C 47.5 11, 47.5 5, 50 2 C 52.5 5, 52.5 11, 50 15 Z" 
          stroke="url(#maatriGoldGradient)"
          strokeWidth="2.4"
          fill="none"
          variants={leafVariants}
          initial="hidden"
          animate="visible"
        />
        {/* Left Leaf (Tilted Left) */}
        <motion.path 
          d="M 45 16.5 C 41 15, 38.5 10, 40 5 C 43.5 6.5, 45.5 11.5, 45 16.5 Z" 
          stroke="url(#maatriGoldGradient)"
          strokeWidth="2.4"
          fill="none"
          variants={leafVariants}
          initial="hidden"
          animate="visible"
        />
        {/* Right Leaf (Tilted Right) */}
        <motion.path 
          d="M 55 16.5 C 59 15, 61.5 10, 60 5 C 56.5 6.5, 54.5 11.5, 55 16.5 Z" 
          stroke="url(#maatriGoldGradient)"
          strokeWidth="2.4"
          fill="none"
          variants={leafVariants}
          initial="hidden"
          animate="visible"
        />

        {/* 3. Three Triadic Pearls/Seed Dots Inside arranged as inverted triangle */}
        <motion.circle 
          cx="42.5" 
          cy="31.5" 
          r="3.5" 
          fill="url(#maatriGoldGradient)"
          variants={dotVariants}
          custom={0}
          initial="hidden"
          animate="visible"
        />
        <motion.circle 
          cx="57.5" 
          cy="31.5" 
          r="3.5" 
          fill="url(#maatriGoldGradient)"
          variants={dotVariants}
          custom={1}
          initial="hidden"
          animate="visible"
        />
        <motion.circle 
          cx="50" 
          cy="39.5" 
          r="3.5" 
          fill="url(#maatriGoldGradient)"
          variants={dotVariants}
          custom={2}
          initial="hidden"
          animate="visible"
        />

        {/* 4. Two Sweeping Inner Cradle/Lotus Leaves */}
        {/* Left Inner Leaf */}
        <motion.path 
          d="M 50 90 C 18 80, 11 56, 22 39 C 28 54, 40 76, 50 90 Z" 
          stroke="url(#maatriGoldGradient)"
          strokeWidth="2.8"
          fill="none"
          variants={leafVariants}
          initial="hidden"
          animate="visible"
        />
        {/* Right Inner Leaf */}
        <motion.path 
          d="M 50 90 C 82 80, 89 56, 78 39 C 72 54, 60 76, 50 90 Z" 
          stroke="url(#maatriGoldGradient)"
          strokeWidth="2.8"
          fill="none"
          variants={leafVariants}
          initial="hidden"
          animate="visible"
        />
      </svg>
    </motion.div>
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
      <div className="mx-auto flex max-w-7xl h-22 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand Title representing postpartum and newborn protection */}
        <div 
          className="flex cursor-pointer items-center space-x-3 sm:space-x-4" 
          onClick={() => setActiveTab('home')}
          id="brand-logo"
        >
          <ElegantLogo />
          <div>
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[#DFB15B] via-[#C59B27] to-[#8A6D1C] bg-clip-text text-transparent leading-none block select-none">
              MaatriSparsh
            </span>
            <span className="block text-[9px] sm:text-[10px] font-serif text-[#C59B27]/95 mt-1 font-medium tracking-wide select-none">
              {language === 'en' ? 'The Healing Touch for a Mother' : 'प्रसवोत्तर और नवजात शिशु कल्याण केंद्र'}
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
