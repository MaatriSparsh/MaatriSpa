import { useState, SVGProps } from 'react';
import { Facebook, Instagram, Heart, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageProvider';

const WhatsAppIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.704 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface SocialChannel {
  id: string;
  name: string;
  nameHindi: string;
  icon: any;
  href: string;
  colorClass: string;
  glowClass: string;
  badgeText: string;
  badgeTextHindi: string;
  subtitle: string;
  ringColor: string;
}

export default function FloatingSocial() {
  const { language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const channels: SocialChannel[] = [
    {
      id: 'facebook',
      name: 'Facebook Page',
      nameHindi: 'फेसबुक पेज',
      icon: Facebook,
      href: 'https://www.facebook.com/profile.php?id=61572016331977',
      colorClass: 'bg-gradient-to-br from-[#1877F2] to-[#125ba3]',
      glowClass: 'shadow-[0_0_20px_rgba(24,119,242,0.4)] hover:shadow-[0_0_25px_rgba(24,119,242,0.65)]',
      badgeText: 'Care Community',
      badgeTextHindi: 'सुरक्षा समुदाय',
      subtitle: 'Visit our active Facebook hub',
      ringColor: 'focus:ring-blue-300',
    },
    {
      id: 'instagram',
      name: 'Instagram Circle',
      nameHindi: 'इंस्टाग्राम सर्कल',
      icon: Instagram,
      href: 'https://www.instagram.com/maatrisparsh',
      colorClass: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F56040]',
      glowClass: 'shadow-[0_0_20px_rgba(224,45,84,0.4)] hover:shadow-[0_0_25px_rgba(224,45,84,0.65)]',
      badgeText: 'Maternal Wellness',
      badgeTextHindi: 'मातृत्व कल्याण',
      subtitle: 'Follow daily postpartum insights',
      ringColor: 'focus:ring-rose-300',
    },
    {
      id: 'whatsapp',
      name: 'Chat with MaatriSparsh',
      nameHindi: 'व्हाट्सएप्प चैट',
      icon: WhatsAppIcon,
      href: 'https://wa.me/919183216100',
      colorClass: 'bg-gradient-to-br from-[#25D366] to-[#128C7E]',
      glowClass: 'shadow-[0_0_20px_rgba(37,211,102,0.45)] hover:shadow-[0_0_25px_rgba(37,211,102,0.7)]',
      badgeText: 'Maternal Support',
      badgeTextHindi: 'मातृस्पर्श टीम',
      subtitle: '+91 9183216100 Official',
      ringColor: 'focus:ring-[#25D366]',
    }
  ];

  return (
    <div 
      className="fixed bottom-6 right-6 z-45 flex flex-col items-end space-y-3.5 sm:space-y-4 max-w-[320px]" 
      id="floating-social-widget"
    >
      <AnimatePresence>
        {hoveredId && (
          <motion.div
            key={hoveredId}
            initial={{ opacity: 0, x: 20, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 15, scale: 0.92 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-16 bottom-[calc(var(--offset)*56px+32px)] sm:bottom-[calc(var(--offset)*64px+40px)] mr-1 bg-stone-900 border border-[#b45309]/30 text-stone-50 px-4 py-2.5 rounded-2xl shadow-2xl text-right z-50 pointer-events-none w-56 sm:w-64"
            style={{ 
              '--offset': channels.length - 1 - channels.findIndex(c => c.id === hoveredId)
            } as any}
          >
            {/* Elegant Blush Tag line inside the active tooltip */}
            <span className="inline-flex items-center space-x-1 py-0.5 px-2 rounded-full bg-[#FFF1F2] text-rose-800 text-[8.5px] font-black uppercase tracking-wider mb-1 px-2 border border-rose-100">
              <Heart className="h-2.5 w-2.5 text-rose-500 fill-rose-500 animate-pulse" />
              <span>
                {language === 'en' 
                  ? channels.find(c => c.id === hoveredId)?.badgeText 
                  : channels.find(c => c.id === hoveredId)?.badgeTextHindi}
              </span>
            </span>
            <p className="text-xs font-bold font-serif text-white tracking-normal leading-tight">
              {language === 'en' 
                ? channels.find(c => c.id === hoveredId)?.name 
                : channels.find(c => c.id === hoveredId)?.nameHindi}
            </p>
            <div className="text-[10px] text-stone-350 mt-1 leading-snug">
              {channels.find(c => c.id === hoveredId)?.subtitle}
            </div>
            <div className="text-[8px] font-mono font-bold text-amber-500 uppercase tracking-widest mt-1 mr-0.5 inline-flex items-center space-x-1">
              <span>{language === 'en' ? 'Click to Open' : 'खोलने के लिए छुएं'}</span>
              <ArrowUpRight className="h-2.5 w-2.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating social chain rendering vertically upward */}
      <div className="flex flex-col items-center space-y-3 sm:space-y-3.5">
        {channels.map((chan) => {
          const Icon = chan.icon;
          return (
            <motion.a
              key={chan.id}
              href={chan.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={chan.name}
              onMouseEnter={() => setHoveredId(chan.id)}
              onMouseLeave={() => setHoveredId(null)}
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.94 }}
              className={`relative flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full text-white cursor-pointer border-2 border-white shadow-lg overflow-hidden outline-hidden focus:ring-4 transition-all duration-300 ${chan.colorClass} ${chan.glowClass} ${chan.ringColor}`}
            >
              {/* Refined Gold/Blush highlighting aura */}
              <div className="absolute inset-0 bg-[#FFE4E6]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              
              {/* Pulse effect only on WhatsApp for highlighted attention */}
              {chan.id === 'whatsapp' && (
                <span className="absolute -inset-1 rounded-full border border-emerald-400 animate-ping opacity-30 pointer-events-none" />
              )}
              
              <Icon className="h-5.5 w-5.5 sm:h-6 sm:w-6 filter drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.15)] transition-transform group-hover:scale-105" />
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
