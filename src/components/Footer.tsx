import { MapPin, Mail, Phone, Clock, Heart, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { ElegantLogo } from './Header';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
}

export default function Footer({ setActiveTab, onOpenBooking }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { t, language } = useLanguage();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-900" id="app-footer">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          
          {/* Brand/Mission column targeting Mother & Newborn Care */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <ElegantLogo />
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-[#DFB15B] via-[#C59B27] to-[#8A6D1C] bg-clip-text text-transparent">
                MaatriSparsh
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-stone-400">
              {t.footerTagline}
            </p>
            <div className="italic text-xs text-amber-500 font-serif">
              {language === 'en' 
                ? '"Gently Healing the Mother, Nurturing the Newborn."' 
                : '"माता का स्नेहपूर्ण उपचार, नवजात शिशु की सुदृढ़ देखभाल।"'}
            </div>
          </div>

          {/* Quick Navigations */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-serif">
              {language === 'en' ? 'Our Sanctuary Links' : 'महत्वपूर्ण लिंक्स'}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm" id="footer-navigation">
              {[
                { id: 'home', label: t.tabHome },
                { id: 'about', label: t.tabAbout },
                { id: 'services', label: t.tabServices },
                { id: 'contact', label: t.tabContact },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => setActiveTab(link.id)}
                    className="hover:text-amber-500 transition-colors cursor-pointer text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={onOpenBooking}
                  className="text-emerald-400 hover:text-emerald-350 transition-colors font-medium text-left cursor-pointer"
                >
                  {language === 'en' ? 'Schedule A Visit →' : 'एक सत्र बुक करें →'}
                </button>
              </li>
            </ul>
          </div>

          {/* Healing & Visiting Hours */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-serif">
              {language === 'en' ? 'Support Timings' : 'सहायता का समय'}
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-400">
              <li className="flex items-start space-x-2.5">
                <Clock className="h-4.5 w-4.5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block font-medium text-stone-200">
                    {language === 'en' ? 'Postpartum Home Visits' : 'प्रसवोत्तर गृह सेवा'}
                  </span>
                  <span className="text-xs">Daily / प्रतिदिन: 07:00 AM — 08:00 PM</span>
                </div>
              </li>
              <li className="flex items-start space-x-2.5">
                <Clock className="h-4.5 w-4.5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block font-medium text-stone-200">
                    {language === 'en' ? 'In-Sanctum Consultations' : 'केंद्र परामर्श समय'}
                  </span>
                  <span className="text-xs">Mon - Sat / सोेम - शनि: 08:30 AM — 06:00 PM</span>
                </div>
              </li>
              <li className="text-[10px] sm:text-[11px] text-amber-500/80 border-t border-stone-900 pt-2.5">
                {language === 'en' 
                  ? '*24/7 emergency lactation guidance hotline is accessible for registered postpartum mothers.'
                  : '*पंजीकृत नई माताओं के लिए २४/७ आपातकालीन स्तनपान हेल्पलाइन खुली है।'}
              </li>
            </ul>
          </div>

          {/* Location & Telephone Coordinates */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-serif">
              {t.footerPhoneLabel}
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-400">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <span className="leading-snug">
                  Unit 2. Govind Kunj, 1st floor,<br />
                  near icici bank, civil lines, Raipur, Chhattishgarg, 492001
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span>+91 9183216100</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span className="break-all">care.maatrisparsh@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-900 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-stone-500">
          <p>&copy; {currentYear} {t.footerRights}</p>
          
          {/* Beautiful premium social icons row */}
          <div className="flex items-center space-x-3" id="footer-social-section">
            <span className="text-[10px] tracking-widest font-mono text-stone-605 uppercase font-bold mr-1">
              {language === 'en' ? 'Connect With Us' : 'जुड़ें हमारे साथ'}
            </span>
            <a
              href="https://wa.me/919183216100"
              target="_blank"
              rel="noopener noreferrer"
              title="Chat with MaatriSparsh on WhatsApp"
              aria-label="Connect with MaatriSparsh on WhatsApp"
              className="group flex h-8 w-8 items-center justify-center rounded-full border border-stone-800 bg-stone-900/60 transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-950/20 hover:text-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.35)] text-stone-400 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61572016331977"
              target="_blank"
              rel="noopener noreferrer"
              title="Visit MaatriSparsh on Facebook"
              aria-label="Visit MaatriSparsh on Facebook"
              className="group flex h-8 w-8 items-center justify-center rounded-full border border-stone-800 bg-stone-900/60 transition-all duration-300 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:shadow-[0_0_12px_rgba(24,119,242,0.35)] text-stone-400 cursor-pointer"
            >
              <Facebook className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </a>
            <a
              href="https://www.instagram.com/maatrisparsh"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow MaatriSparsh on Instagram"
              aria-label="Follow MaatriSparsh on Instagram"
              className="group flex h-8 w-8 items-center justify-center rounded-full border border-stone-800 bg-stone-900/60 transition-all duration-300 hover:border-rose-400/50 hover:bg-rose-950/20 hover:text-rose-400 hover:shadow-[0_0_12px_rgba(244,63,94,0.35)] text-stone-400 cursor-pointer"
            >
              <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </a>
          </div>

          <div className="flex items-center space-x-2 text-[10px] sm:text-[11px]">
            <span>{t.footerCertified}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
