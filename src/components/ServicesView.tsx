import { useState } from 'react';
import { Search, Check, Info, Clock, BadgeCent, Sparkles, Filter } from 'lucide-react';
import { SERVICES as STATIC_SERVICES } from '../data';
import { useFirebase } from './FirebaseProvider';
import { useLanguage } from './LanguageProvider';

interface ServicesViewProps {
  onOpenBookingWithService: (serviceId: string) => void;
}

type CategoryFilter = 'all' | 'postpartum_mother' | 'newborn_baby' | 'consultation' | 'workshop';

export default function ServicesView({ onOpenBookingWithService }: ServicesViewProps) {
  const { services } = useFirebase();
  const { t, language } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeServices = services && services.length > 0 ? services : STATIC_SERVICES;

  const filteredServices = activeServices.filter((service) => {
    if (!service.activeStatus) return false;
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    
    const nameStr = language === 'en' ? service.name : service.nameHindi;
    const descStr = language === 'en' ? service.description : service.descriptionHindi;
    const benefitsArr = language === 'en' ? service.benefits : service.benefitsHindi;

    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      nameStr.toLowerCase().includes(query) ||
      descStr.toLowerCase().includes(query) ||
      benefitsArr.some(b => b.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const categories: { id: CategoryFilter; en: string; hi: string; count: number }[] = [
    { 
      id: 'all', 
      en: 'All Care Services', 
      hi: 'सभी सेवाएं',
      count: activeServices.filter(s => s.activeStatus).length 
    },
    { 
      id: 'postpartum_mother', 
      en: 'Maternal Recovery', 
      hi: 'प्रसवोत्तर माता स्वास्थ्य व रिकवरी',
      count: activeServices.filter(s => s.category === 'postpartum_mother' && s.activeStatus).length 
    },
    { 
      id: 'newborn_baby', 
      en: 'Newborn Care & Comfort', 
      hi: 'शिशु स्वास्थ्य व अनुकूलन',
      count: activeServices.filter(s => s.category === 'newborn_baby' && s.activeStatus).length 
    },
    { 
      id: 'consultation', 
      en: 'Latching & Consultations', 
      hi: 'स्तनपान मार्गदर्शन व डॉक्टर परामर्श',
      count: activeServices.filter(s => s.category === 'consultation' && s.activeStatus).length 
    },
    { 
      id: 'workshop', 
      en: 'Parental Workshops', 
      hi: 'नया माता-पिता प्रशिक्षण वर्कशॉप',
      count: activeServices.filter(s => s.category === 'workshop' && s.activeStatus).length 
    },
  ];

  return (
    <div className="py-12 bg-stone-50" id="services-view">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Intention header component */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#a16207] font-mono block">
            {language === 'en' ? 'Our Care Sanctuary' : 'हमारी विशेष मातृत्व सेवाएं'}
          </span>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
            {language === 'en' ? 'Nurturing Motherhood, Preserving Life' : 'मातृत्व का स्नेहमयी पोषण, शिशु का सुदृढ़ स्वास्थ'}
          </h1>
          <div className="h-0.5 w-16 bg-emerald-800 mx-auto rounded-full" />
          <p className="text-stone-500 text-xs sm:text-sm">
            {language === 'en'
              ? 'Select an essential postnatal educational session. Each slot is led by experienced pediatric or lactation care coordinators.'
              : 'विशेष प्रसवोत्तर परामर्श या सत्र का चयन करें। प्रत्येक मार्गदर्शन अनुभवी बाल रोग एवं स्तनपान सलाहकारों द्वारा आयोजित होता।'}
          </p>
        </section>

        {/* Dynamic Filters & Search Panel */}
        <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input Custom Field */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={
                  language === 'en'
                    ? "Search massage, lactation guidance, infant bath recipes..."
                    : "सूतिका मालिश, स्तनपान गाइडेंस, हींग सिकाई खोजें..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-xs font-medium placeholder-stone-400 focus:border-emerald-800 focus:bg-white focus:outline-hidden transition-all"
                id="search-services-input"
              />
            </div>

            {/* Sub-label for filtering */}
            <span className="text-[11px] font-mono text-stone-400 flex items-center space-x-1.5 self-start md:self-auto shrink-0">
              <Filter className="h-3.5 w-3.5 text-emerald-800" />
              <span>
                {language === 'en' ? 'Categorized according to clinical needs' : 'शारीरिक आवश्यकताओं के अनुसार अनुभाग देखें'}
              </span>
            </span>
          </div>

          {/* Filtering Tabs Panel */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-100" id="category-filter-chips">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-stone-50 shadow-xs'
                    : 'bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-605'
                }`}
              >
                {language === 'en' ? cat.en : cat.hi} <span className="text-[10px] opacity-70 ml-0.5">({cat.count})</span>
              </button>
            ))}
          </div>
        </section>

        {/* Highlighted Warning Box about early Postpartum delicate state */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start space-x-3.5">
          <Info className="h-5.5 w-5.5 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-stone-900 block font-serif">
              {language === 'en' ? 'A Gentle Postnatal Safety Note' : 'शिशु व माता सुरक्षा परामर्श निर्देश'}
            </span>
            <span className="text-stone-600 block leading-relaxed">
              {language === 'en'
                ? 'Infants under 2 weeks old require specialized touch pressure. For extremely early postpartum days, we highly recommend scheduling a Latching Session or Maternal Postpartum Restores before starting deep pediatric massage protocols.'
                : '१४ दिनों से कम आयु वाले नवजात शिशुओं की हड्डियां अत्यधिक लचीली होती हैं। बेहद शुरुआती प्रसवोत्तर दिनों में प्रगाढ़ मालिश सत्र शुरू करने से पहले स्तनपान लैचिंग सुधारना एवं माता के पेल्विक संरेखण की विशेष सूतिका मालिश करवाना अधिक सुरक्षदायक माना जाता है।'}
            </span>
          </div>
        </section>

        {/* Services Listings Grid */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-2" id="filtered-services-grid">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => {
              const nameValue = language === 'en' ? service.name : service.nameHindi;
              const descValue = language === 'en' ? service.description : service.descriptionHindi;
              const benefitsValue = language === 'en' ? service.benefits : service.benefitsHindi;

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  {/* Image and Basic Specs block */}
                  <div>
                    <div className="relative h-56 overflow-hidden bg-stone-100">
                      <img
                        src={service.image}
                        alt={nameValue}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Category Label Pin */}
                      <div className="absolute top-4 left-4 bg-emerald-900/95 text-stone-100 py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-850">
                        {service.category.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-4">
                      <div className="flex justify-between items-start gap-3">
                        <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-950 leading-tight">
                          {nameValue}
                        </h2>
                      </div>

                      <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                        {descValue}
                      </p>

                      <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-xl bg-stone-50 border border-stone-110 text-xs text-stone-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4.5 w-4.5 text-emerald-800" />
                          <span>
                            {language === 'en' ? 'Duration:' : 'अवधि:'} <strong>{service.duration} {language === 'en' ? 'Mins' : 'मिनट'}</strong>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BadgeCent className="h-4.5 w-4.5 text-[#a16207]" />
                          <span>
                            {language === 'en' ? 'Fee:' : 'परामर्श शुल्क:'} <strong>₹{service.priceInr.toLocaleString('en-IN')}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Bullet Benefits list representing premium care parameters */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-mono block">
                          {language === 'en' ? 'Verified Healing Benefits' : 'इस उपचार के शारीरिक लाभ'}
                        </span>
                        <ul className="space-y-1.5 text-xs text-stone-650">
                          {benefitsValue.map((benefit, bIdx) => (
                            <li key={bIdx} className="flex items-start space-x-2">
                              <Check className="h-4 w-4 text-emerald-800 mt-0.5 shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Card Booking Activation Footer panel */}
                  <div className="p-6 sm:p-8 pt-0 mt-auto border-t border-stone-100 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] uppercase text-stone-400 font-mono font-bold leading-none">
                        {language === 'en' ? 'Complete Session Fee:' : 'कुल सत्र खर्च:'}
                      </span>
                      <span className="font-serif font-black text-2xl text-emerald-900">
                        ₹{service.priceInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenBookingWithService(service.id)}
                      className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-stone-50 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors hover:shadow-xs active:scale-95 cursor-pointer"
                    >
                      {t.bookBtn}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-20 space-y-3 bg-white border border-stone-200 rounded-3xl">
              <Sparkles className="h-8 w-8 text-stone-300 mx-auto" />
              <p className="text-stone-605 text-sm font-serif font-medium">
                {language === 'en' ? 'No postpartum remedies matched your exact search phrase.' : 'आपकी खोज के अनुसार कोई प्रसवोत्तर पैकेज नहीं मिला।'}
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="text-emerald-800 hover:text-emerald-950 font-bold text-xs underline cursor-pointer"
              >
                {language === 'en' ? 'Reset Search Filters' : 'सर्च फिल्टर हटाएँ'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
