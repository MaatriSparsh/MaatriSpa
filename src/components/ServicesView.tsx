import { useState } from 'react';
import { Check, Info, BadgeCent, ChevronDown, ChevronUp, Heart, Star, Shield, X, Sparkle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageProvider';

interface ServicesViewProps {
  onOpenBookingWithService: (serviceId: string) => void;
}

interface PremiumPackage {
  id: string;
  nameEn: string;
  nameHi: string;
  durationEn: string;
  durationHi: string;
  priceBadgeEn: string;
  priceBadgeHi: string;
  price: number;
  descriptionEn: string;
  descriptionHi: string;
  includesEn: string[];
  includesHi: string[];
  extendedDetailsEn: string[];
  extendedDetailsHi: string[];
  image: string;
  taglineEn: string;
  taglineHi: string;
}

export default function ServicesView({ onOpenBookingWithService }: ServicesViewProps) {
  const { language } = useLanguage();

  // Primary Programme Accordion state: 'normal' | 'lscs' | null
  const [expandedProgramme, setExpandedProgramme] = useState<'normal' | 'lscs' | null>('normal');
  const [selectedDetailPackage, setSelectedDetailPackage] = useState<PremiumPackage | null>(null);

  // Premium packages details corresponding to requested structure
  const normalProgrammePackages: PremiumPackage[] = [
    {
      id: 'normal-sukoon-7',
      nameEn: 'Sukoon Saptah',
      nameHi: 'सुकून सप्ताह',
      durationEn: '7 Days Programme',
      durationHi: '7 दिवसीय कार्यक्रम',
      priceBadgeEn: 'Starts at Rs.1499/- Only',
      priceBadgeHi: 'मात्र ₹1499/- से शुरू',
      price: 1499,
      taglineEn: 'Restorative Postpartum Comfort',
      taglineHi: 'प्रसवोत्तर सुखदायक विश्राम और बल',
      descriptionEn: 'A luxury 7-day postpartum rehabilitation sequence designed for rapid somatic relief and gentle recovery after natural childbirth.',
      descriptionHi: 'नॉर्मल डिलीवरी के बाद माताओं के त्वरित शारीरिक उद्धार और मानसिक विश्राम के लिए 7 दिनों की सबसे पसंदीदा पारंपरिक थेरेपी।',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
      includesEn: [
        'Mother Care & Lactation Training',
        'Baby Care',
        'Pain Management',
        'Vital Monitoring',
        'Nutritional Support'
      ],
      includesHi: [
        'माता सूतिका थेरेपी और स्तनपान (लैक्टेशन) सुधार मार्गदर्शन',
        'नवजात शिशु की अत्यंत कोमल मालिश और पारंपरिक स्नान सत्र',
        'कमर दर्द, पीठ दर्द एवं मांसपेशियों के संकुचन का दर्द प्रबंधन',
        'माता एवं शिशु स्वास्थ्य के महत्वपूर्ण मापदंडों (वािटल्स) की लाइव निगरानी',
        'प्रसवोत्तर काल के अनुकूल पौष्टिक, सुपाच्य पारंपरिक भोजन मार्गदर्शन'
      ],
      extendedDetailsEn: [
        'Dedicated postnatal therapist visits your residence for 60-90 mins daily.',
        'Warm customized herbal oil formulation selected according to your body constituency.',
        'Hands-on guidance on correct infant latching positions and postures.',
        'Soothes pelvic muscles and assists in gentle digestive alignment.'
      ],
      extendedDetailsHi: [
        'अनुभवी प्रसवोत्तर सलाहकार प्रतिदिन 60-90 मिनट के लिए आपके घर आते हैं।',
        'शरीर की प्रकृति (वात-पित्त-कफ) के अनुसार औषधीय गुनगुने तेल का चयन।',
        'स्तनपान की सही और दर्द रहित एर्गोनोमिक मुद्राओं का प्रत्यक्ष प्रशिक्षण।',
        'पेल्विक संरेखण और पेट की गैस व अपच जैसी सामान्य समस्याओं से मुक्ति।'
      ]
    },
    {
      id: 'normal-puran-14',
      nameEn: 'Puran Aarohan',
      nameHi: 'पूर्ण आरोहण',
      durationEn: '14 Days Programme',
      durationHi: '14 दिवसीय कार्यक्रम',
      priceBadgeEn: 'Starts at Rs.1499/- Only',
      priceBadgeHi: 'मात्र ₹1499/- से शुरू',
      price: 1499,
      taglineEn: 'The Ultimate Rejuvenation Pathway',
      taglineHi: 'संपूर्ण सूतिका अभ्यंग और पेट बांधना',
      descriptionEn: 'The absolute gold-standard 14-day traditional Indian postnatal restoration, involving complete stomach binding and deep recovery therapies.',
      descriptionHi: '14 दिनों की पूर्ण प्रसवोत्तर रिकवरी चिकित्सा। पारंपरिक कपड़ा बांधने (बेली बाइंडिंग) और सघन थेरेपी से गर्भाशय को यथास्थान वापस लाना।',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
      includesEn: [
        'Mother Care & Lactation Training',
        'Baby Care',
        'Pain Management',
        'Vital Monitoring',
        'Nutritional Support',
        'Nurse Visit',
        'Holistic Spa'
      ],
      includesHi: [
        'माता सूतिका थेरेपी और स्तनपान (लैक्टेशन) सुधार मार्गदर्शन',
        'नवजात शिशु की अत्यंत कोमल मालिश और पारंपरिक स्नान सत्र',
        'कमर दर्द, पीठ दर्द एवं मांसपेशियों के संकुचन का दर्द प्रबंधन',
        'माता एवं शिशु स्वास्थ्य के महत्वपूर्ण मापदंडों की लाइव निगरानी',
        'प्रसवोत्तर काल के अनुकूल पौष्टिक, सुपाच्य पारंपरिक भोजन मार्गदर्शन',
        'लाइसेंस प्राप्त क्लिनिकल नर्स विजिट द्वारा टांकों और प्रसव घावों का आकलन',
        'हर्बल वेपर बाथ और संपूर्ण विलासितापूर्ण प्राकृतिक स्पा डिटॉक्स'
      ],
      extendedDetailsEn: [
        'Features the sacred traditional cotton stomach wrapping (Belly Binding) to restore abdominal muscle tone.',
        'Complete 14 sessions of rejuvenating body massage utilizing certified Ayurvedic Tailam.',
        'Registered clinical nurse checkup to monitor postpartum blood pressure, pelvic healing, and nursery guidelines.',
        'Luxurious herbal-infusion warm bath therapies that leave you feeling light and completely renewed.'
      ],
      extendedDetailsHi: [
        'गर्भाशय और पेट के मांसपेशियों की टोन वापस लाने के लिए सूती कपड़े द्वारा पारंपरिक पेट बांधने की सघन विधि।',
        'प्रमाणित केरल आयुर्वेदिक जड़ी-बूटियों के तेल से बने रिलैक्सेशन मालिश के पूरे 14 सत्र।',
        'पंजीकृत नर्स द्वारा प्रसवोत्तर रक्तचाप, टांके के जुड़ाव और शिशु की सुरक्षा की नैदानिक जांच।',
        'शरीर को हल्का करने और नकारात्मक तनावों को समाप्त करने के लिए सुखदायक हर्बल स्टीम चिकित्सा।'
      ]
    }
  ];

  const lscsProgrammePackages: PremiumPackage[] = [
    {
      id: 'lscs-navya-4',
      nameEn: 'Navya Recovery',
      nameHi: 'नव्या रिकवरी',
      durationEn: '4 Days Programme',
      durationHi: '4 दिवसीय कार्यक्रम',
      priceBadgeEn: 'Starts at Rs.1499/- Only',
      priceBadgeHi: 'मात्र ₹1499/- से शुरू',
      price: 1499,
      taglineEn: 'Specialized C-Section Posture Relief',
      taglineHi: 'सी-सेक्शन टांकों की सुरक्षा और गतिशीलता',
      descriptionEn: 'A highly delicate and supportive 4-day intensive care sequence centered strictly on surgical incision safety, posture alignment, and safe recovery.',
      descriptionHi: 'सिजेरियन डिलीवरी के तुरंत बाद, टांकों को बिना नुकसान पहुंचाए मांसपेशियों को आराम देने और पीठ दर्द कम करने के लिए 4 दिनों का सघन पैकेज।',
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
      includesEn: [
        'Mother Care',
        'Baby Care',
        'Pain Management',
        'Holistic Spa'
      ],
      includesHi: [
        'सिजेरियन डिलीवरी विशिष्ट माता की अत्यंत सुरक्षित और कोमल शारीरिक देखभाल',
        'नवजात शिशु की नाजुक मालिश और वार्म-वेलनेस स्पंजिंग या कोमल स्नान',
        'मांसपेशियों में जकड़न दूर करने के लिए कोमल पैर और ऊपरी रीढ़ की थेरेपी',
        'हल्के कस्टमाइज़्ड सुखदायक स्ट्रोक्स के साथ होलिस्टिक प्रसूति रिलैक्सेशन स्पा'
      ],
      extendedDetailsEn: [
        'Focused carefully on avoiding any pressure on the lower abdominal section or suture line.',
        'Gentle lymphatic-promoting touch on upper back and limbs to clear surgical fluid accumulation and swelling.',
        'Practical coaching on comfortable side-lying nursing strategies to prevent pulling the stitches.',
        'Aromatic, relaxing postpartum head and neck therapy to clear hospital fatigue.'
      ],
      extendedDetailsHi: [
        'कमर के निचले हिस्से और सिजेरियन के टांकों पर शून्य दबाव सुनिश्चित करते हुए की जाने वाली कोमल चिकित्सा।',
        'शरीर की सूजन और प्रसवकालीन दवाओं के संचय को दूर करने के लिए हाथ-पैरों की विशेष कोमल थेरेपी।',
        'टांकों की खिंचाव रहित स्थिति में लेटकर स्तनपान कराने की आरामदायक एर्गोनोमिक मुद्राओं का अभ्यास।',
        'अस्पताल के तनाव और नींद की कमी को मिटाने के लिए अति-सुखदायक सिर, गर्दन और कंधे की मालिश।'
      ]
    },
    {
      id: 'lscs-sukoon-7',
      nameEn: 'Sukoon Saptah',
      nameHi: 'सुकून सप्ताह',
      durationEn: '7 Days Programme',
      durationHi: '7 दिवसीय कार्यक्रम',
      priceBadgeEn: 'Starts at Rs.1499/- Only',
      priceBadgeHi: 'मात्र ₹1499/- से शुरू',
      price: 1499,
      taglineEn: 'Tailored Post-Surgical Strength',
      taglineHi: 'सिजेरियन गतिशीलता और रीढ़ संरेखण',
      descriptionEn: 'A supportive 7-day program to help C-section mothers regain strength. Includes lactic swelling drainage, wound protection training, and posture help.',
      descriptionHi: 'सी-सेक्शन प्रसव के बाद शरीर में जकड़न को समाप्त करने और माताओं को सहज संचलन में मदद करने के लिए 7 दिनों का कल्याण कार्यक्रम।',
      image: 'https://images.unsplash.com/photo-1581579438747-1dc8d1e0ca96?auto=format&fit=crop&w=600&q=80',
      includesEn: [
        'Mother Care & Lactation Training',
        'Baby Care',
        'Pain Management',
        'Vital Monitoring',
        'Nutritional Support',
        'Holistic Spa'
      ],
      includesHi: [
        'माता का सिजेरियन विशिष्ट मार्गदर्शन और उन्नत स्तनपान पकड़ प्रशिक्षण',
        'नवजात शिशु की कोमल मालिश और पारंपरिक वार्म बॉथ पानी चिकित्सा',
        'दर्द निवारक प्राकृतिक चिकित्सा एवं कोमल पेल्विक मांसपेशी उद्धार सत्र',
        'लैक्टेशन और प्रसवोत्तर महत्वपूर्ण स्वास्थ्य मापदंडों की नर्स द्वारा निगरानी',
        'प्रसवोत्तर पाचन सुधार और तेजी से घाव भरने वाला संतुलित पोषण आहार',
        'सज्जित हर्बल स्ट्रोक्स के साथ माता के लिए रिलैक्सेशन सूतिका स्पा'
      ],
      extendedDetailsEn: [
        'Gradual and gentle activation of the core area using breathing and supportive posture techniques.',
        'Wound line inspection guidelines to minimize risk of stretch or strain.',
        'Therapeutic foot massage to reduce C-section ankle swelling and improve circulatory metrics.',
        'Lactation holding techniques that completely protect the abdomen.'
      ],
      extendedDetailsHi: [
        'सौम्य सांस लेने के पैटर्न और सुधारात्मक बैठकों द्वारा कोर हिस्से को ताकत देना।',
        'टांकों के खिंचाव को रोकने और उनकी उचित सुरक्षा करने का वैज्ञानिक प्रशिक्षण।',
        'पैरों और टखनों की सूजन (Swelling) को तेजी से समाप्त करने के लिए विशेष रिफ्लेक्सोलॉजी मसाज।',
        'स्तनपान के दौरान सुरक्षा के लिए विशेष रूप से डिजाइन किए गए आरामदायक एर्गोनोमिक घेरे।'
      ]
    },
    {
      id: 'lscs-puran-14',
      nameEn: 'Puran Aarohan',
      nameHi: 'पूर्ण आरोहण',
      durationEn: '14 Days Programme',
      durationHi: '14 दिवसीय कार्यक्रम',
      priceBadgeEn: 'Starts at Rs.1499/- Only',
      priceBadgeHi: 'मात्र ₹1499/- से शुरू',
      price: 1499,
      taglineEn: 'The Ultimate Cesarean Care Sanctuary',
      taglineHi: 'सी-सेक्शन विशिष्ट संपूर्ण आरोग्यता',
      descriptionEn: 'The absolute gold-standard 14-day fully integrated C-section rehabilitation package with customized medical supervision and professional spa support.',
      descriptionHi: '14 दिनों की सी-सेक्शन विशिष्ट संपूर्ण शारीरिक एवं भावनात्मक कल्याण प्रणाली। इसमें क्लिनिकल नर्स विजिट और संपूर्ण स्पा सुख शामिल हैं।',
      image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80',
      includesEn: [
        'Mother Care & Lactation Training',
        'Baby Care',
        'Pain Management',
        'Vital Monitoring',
        'Nutritional Support',
        'Nurse Visit',
        'Holistic Spa'
      ],
      includesHi: [
        'माता का सिजेरियन विशिष्ट मार्गदर्शन और उन्नत स्तनपान पकड़ प्रशिक्षण',
        'नवजात शिशु की कोमल मालिश और पारंपरिक वार्म बॉथ पानी चिकित्सा',
        'दर्द निवारक प्राकृतिक चिकित्सा एवं कोमल पेल्विक मांसपेशी उद्धार सत्र',
        'लैक्टेशन और प्रसवोत्तर महत्वपूर्ण स्वास्थ्य मापदंडों की नर्स द्वारा निगरानी',
        'प्रसवोत्तर पाचन सुधार और तेजी से घाव भरने वाला संतुलित पोषण आहार',
        'लाइसेंस प्राप्त क्लिनिकल नर्स विजिट द्वारा टांकों और प्रसव घावों का आकलन',
        'आयुर्वेदिक औषधीय स्पा एवं कोमल सूतिका हेड-टू-टो विलासितापूर्ण केयर थेरेपी'
      ],
      extendedDetailsEn: [
        'Lymphatic drainage strokes to completely clear post-surgery medication heavy fluids.',
        'Supportive pelvis structural correction and spinal alignment therapies.',
        'Detailed traditional nutritional recipes that support cell regeneration and fast-track deep incision healing.',
        'Licensed nurse visit to review surgical healing progress and certify baby health parameters.'
      ],
      extendedDetailsHi: [
        'शल्य क्रिया की भारी दवाओं के कारण होने वाले लिम्फ संचय व भारी पानीपन को मिटाने के लिए विशेष ड्रेनेज स्ट्रोक्स।',
        'पीठ के तनाव और प्रसव के दौरान रीढ़ की हड्डी में हुए झुकाव का कोमल संरेखण सुधार।',
        'तेजी से आंतरिक कोशिकाओं का नवीनीकरण (Incision Healing) करने वाली उत्कृष्ट पारंपरिक आहार सामग्री।',
        'लाइसेंस प्राप्त सिजेरियन केयर विशेषज्ञ नर्स द्वारा प्रसवोत्तर स्वास्थ्य का विस्तृत परीक्षण।'
      ]
    }
  ];

  const toggleProgramme = (prog: 'normal' | 'lscs') => {
    setExpandedProgramme(expandedProgramme === prog ? null : prog);
  };

  const handleOpenDetail = (pkg: PremiumPackage) => {
    setSelectedDetailPackage(pkg);
  };

  const handleCloseDetail = () => {
    setSelectedDetailPackage(null);
  };

  return (
    <div className="py-12 bg-[#FDFBF7]" id="services-view">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Intention header with luxury branding */}
        <section className="text-center max-w-3xl mx-auto space-y-3" id="services-hero-header">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#C59B27] font-serif block">
            {language === 'en' ? 'Our Care Sanctuaries & Recoveries' : 'हमारी विशेष मातृत्व सुखदा और रिकवरी सैनक्टम'}
          </span>
          <h1 className="font-serif text-3.5xl font-extrabold tracking-tight text-stone-900 sm:text-5xl leading-tight">
            {language === 'en' 
              ? 'Premium Postnatal Care Programmes' 
              : 'विशेष प्रसवोत्तर कल्याण एवं शारीरिक रिकवरी कार्यक्रम'}
          </h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-[#DFB15B] to-[#8A6D1C] mx-auto rounded-full" />
          <p className="text-stone-605 text-sm sm:text-base leading-relaxed">
            {language === 'en'
              ? 'Traditional, medically compliant recovery pathways delivered in the absolute comfort of your home. Select the program curated specifically according to your delivery type.'
              : 'शिशु जन्म के नाजुक ७ हफ्तों के दौरान माता की सुरक्षा और शारीरिक संवर्धन के विशेष कार्यक्रम। अपने प्रसव के आधार पर सही आरोग्यता कार्यक्रम का चयन करें।'}
          </p>
        </section>

        {/* Elegant Territory Alert Reminder */}
        <div className="bg-amber-50/75 border border-amber-100 rounded-2xl p-4.5 flex items-center justify-between gap-4 max-w-4xl mx-auto shadow-xs">
          <div className="flex items-center space-x-3 text-stone-900">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C59B27]"></span>
            </span>
            <p className="text-xs sm:text-sm font-medium leading-normal">
              <strong>{language === 'en' ? 'Raipur, Bhilai, & Durg Exclusive Service:' : 'रायपुर, भिलाई और दुर्ग विशिष्ट सेवा:'}</strong>{' '}
              {language === 'en' 
                ? 'All postnatal programmes are exclusively available within the twin-city Raipur metro territory. Registered professional therapists will coordinate care directly at your home.' 
                : 'सभी प्रसवोत्तर प्रोग्राम केवल रायपुर, भिलाई और दुर्ग क्षेत्र में उपलब्ध हैं। हमारे पेशेवर चिकित्सक सीधे आपके घर आकर सेवा प्रदान करेंगे।'}
            </p>
          </div>
        </div>

        {/* THE EXCITING NESTED SERVICE LAYOUT */}
        <div className="space-y-6 max-w-5xl mx-auto" id="programmes-accordions-group">
          
          {/* ================= CATEGORY 1 ACCORDION CARD ================= */}
          <div 
            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
              expandedProgramme === 'normal' 
                ? 'border-[#C59B27]/60 bg-white shadow-md shadow-[#C59B27]/5' 
                : 'border-stone-200 bg-stone-50/60 hover:bg-stone-50 hover:border-stone-300'
            }`}
            id="accordion-normal-programme"
          >
            {/* Accordion Trigger Header */}
            <button
              onClick={() => toggleProgramme('normal')}
              className="w-full text-left p-6 sm:p-8 flex items-center justify-between cursor-pointer focus:outline-hidden"
              aria-expanded={expandedProgramme === 'normal'}
            >
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100 text-rose-500 shadow-inner">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#C59B27] font-semibold uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                      {language === 'en' ? 'Vaginal Delivery Recovery' : 'सामान्य प्रसव चिकित्सा'}
                    </span>
                    <span className="text-xs font-serif text-[#C59B27] font-semibold">{language === 'en' ? 'Popular' : 'सर्वाधिक लोकप्रिय'}</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                    {language === 'en' ? '1. Normal Delivery Programme' : '1. नॉर्मल डिलीवरी केयर प्रोग्राम'}
                  </h2>
                  <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-xl">
                    {language === 'en'
                      ? 'Nurturing vaginal posture relief, pelvic muscle tightening, back pain alleviation, and milk supply enhancement.'
                      : 'कमर और गर्भाशय में बल देना, स्तनपान लैचिंग ठीक करना और शरीर के दर्द व थकान को पारंपरिक औषधियों व अभ्यंग द्वारा पूरी तरह दूर करना।'}
                  </p>
                </div>
              </div>
              <div className="text-stone-400 p-1 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors shrink-0 ml-3">
                {expandedProgramme === 'normal' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>

            {/* Expandable Package Cards Grid */}
            <AnimatePresence initial={false}>
              {expandedProgramme === 'normal' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="border-t border-stone-100 bg-[#FDFCF9]"
                >
                  <div className="p-6 sm:p-8 space-y-6">
                    <p className="text-xs sm:text-sm font-serif font-medium text-[#C59B27] border-b border-rose-100 pb-2">
                      ⭐ {language === 'en' ? 'Below are the premier packages available under Normal Delivery Care' : 'नॉर्मल डिलीवरी केयर के अंतर्गत उपलब्ध सर्वोत्तम पैकेजेस की सूची:'}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      {normalProgrammePackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="relative bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between group hover:border-[#C59B27] hover:shadow-md hover:shadow-[#C59B27]/5 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <div>
                            {/* Card Image and Duration */}
                            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-stone-100 mb-5 border border-stone-200/50">
                              <img
                                src={pkg.image}
                                alt={language === 'en' ? pkg.nameEn : pkg.nameHi}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                              />
                              <div className="absolute top-3 left-3 bg-[#C59B27] text-white py-0.5 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                {language === 'en' ? pkg.durationEn : pkg.durationHi}
                              </div>
                            </div>

                            {/* Title & Tagline */}
                            <div className="space-y-1">
                              <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center justify-between">
                                <span>{language === 'en' ? pkg.nameEn : pkg.nameHi}</span>
                                <span className="text-xs font-mono font-bold text-[#C59B27] px-2 py-0.5 bg-amber-50 rounded-md border border-amber-100">
                                  {language === 'en' ? pkg.durationEn.split(' ')[0] : pkg.durationHi.split(' ')[0]} {language === 'en' ? 'Days' : 'दिन'}
                                </span>
                              </h3>
                              <p className="text-xs font-medium text-emerald-800">{language === 'en' ? pkg.taglineEn : pkg.taglineHi}</p>
                            </div>

                            {/* Highlighted pricing badge */}
                            <div className="my-3.5 p-3 rounded-xl bg-orange-50/70 border border-orange-100/60 flex items-center justify-between">
                              <span className="text-xs text-orange-950 font-serif font-extrabold flex items-center space-x-1">
                                <BadgeCent className="h-4 w-4 text-orange-700 shrink-0" />
                                <span>{language === 'en' ? pkg.priceBadgeEn : pkg.priceBadgeHi}</span>
                              </span>
                              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-stone-500 rounded-md py-0.5 px-1.5 bg-stone-100">
                                {language === 'en' ? 'Discount Applied' : 'छूूट स्वीकृत'}
                              </span>
                            </div>

                            <p className="text-stone-600 text-xs leading-relaxed mb-4">
                              {language === 'en' ? pkg.descriptionEn : pkg.descriptionHi}
                            </p>

                            {/* Checklist of Services included */}
                            <div className="space-y-2 mb-6">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#a16207] font-mono">
                                {language === 'en' ? 'What is Included / प्रसवोत्तर सत्र सूचियाँ:' : 'पैकेज के अंतर्गत क्या शामिल है:'}
                              </p>
                              <ul className="grid grid-cols-1 gap-2">
                                {(language === 'en' ? pkg.includesEn : pkg.includesHi).map((item, idx) => (
                                  <li key={idx} className="flex items-start space-x-2 text-xs text-stone-775">
                                    <div className="p-0.5 rounded-full bg-amber-50 border border-amber-200 mt-0.5 shrink-0">
                                      <Check className="h-3 w-3 text-emerald-800" />
                                    </div>
                                    <span className="font-medium leading-normal">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Interactive Buttons */}
                          <div className="pt-4 border-t border-stone-100 flex gap-3">
                            <button
                              onClick={() => onOpenBookingWithService(pkg.id)}
                              className="flex-1 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-xs active:scale-95 cursor-pointer text-center"
                            >
                              {language === 'en' ? 'Book Consultation' : 'कार्यक्रम बुक करें'}
                            </button>
                            <button
                              onClick={() => handleOpenDetail(pkg)}
                              className="flex-1 py-3 px-4 border border-stone-200 hover:border-[#C59B27] hover:text-[#C59B27] text-stone-650 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer bg-stone-50/50 hover:bg-white text-center"
                            >
                              {language === 'en' ? 'Know More' : 'विवरण जानें'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ================= CATEGORY 2 ACCORDION CARD ================= */}
          <div 
            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
              expandedProgramme === 'lscs' 
                ? 'border-[#C59B27]/60 bg-white shadow-md shadow-[#C59B27]/5' 
                : 'border-stone-200 bg-stone-50/60 hover:bg-stone-50 hover:border-stone-300'
            }`}
            id="accordion-lscs-programme"
          >
            {/* Accordion Trigger Header */}
            <button
              onClick={() => toggleProgramme('lscs')}
              className="w-full text-left p-6 sm:p-8 flex items-center justify-between cursor-pointer focus:outline-hidden"
              aria-expanded={expandedProgramme === 'lscs'}
            >
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 text-indigo-500 shadow-inner">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#C59B27] font-semibold uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                      {language === 'en' ? 'Cesarean Delivery Recovery' : 'सिजेरियन डिलीवरी केयर'}
                    </span>
                    <span className="text-xs font-serif text-[#C59B27] font-semibold">{language === 'en' ? 'Highly Specialized' : 'विशेष नैदानिक उपचार'}</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                    {language === 'en' ? '2. LSCS Recovery Programme' : '2. LSCS (सिजेरियन) रिकवरी प्रोग्राम'}
                  </h2>
                  <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-xl">
                    {language === 'en'
                      ? 'Nurturing targeted surgical suture line protection, postural adjustments, physical core realignment, and lymph fluid reduction.'
                      : 'सिजेरियन डिलीवरी के बाद टांकों की सुरक्षा के साथ की जाने वाली चिकित्सीय देखभाल। सूजन कम करने के स्ट्रोक्स, स्पंज बाथ और प्रसवोत्तर स्पा।'}
                  </p>
                </div>
              </div>
              <div className="text-stone-400 p-1 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors shrink-0 ml-3">
                {expandedProgramme === 'lscs' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>

            {/* Expandable Package Cards Grid */}
            <AnimatePresence initial={false}>
              {expandedProgramme === 'lscs' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="border-t border-stone-100 bg-[#FDFCF9]"
                >
                  <div className="p-6 sm:p-8 space-y-6">
                    <p className="text-xs sm:text-sm font-serif font-medium text-[#C59B27] border-b border-rose-100 pb-2">
                      ⭐ {language === 'en' ? 'Below are the highly specialized packages available under LSCS Recovery Care' : 'सिजेरियन विशिष्ट सुरक्षा और आरोग्यता पैकेजों की सूची:'}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                      {lscsProgrammePackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="relative bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between group hover:border-[#C59B27] hover:shadow-md hover:shadow-[#C59B27]/5 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <div>
                            {/* Card Image and Duration */}
                            <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-stone-100 mb-4 border border-stone-200/50">
                              <img
                                src={pkg.image}
                                alt={language === 'en' ? pkg.nameEn : pkg.nameHi}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                              />
                              <div className="absolute top-3 left-3 bg-[#C59B27] text-white py-0.5 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                {language === 'en' ? pkg.durationEn : pkg.durationHi}
                              </div>
                            </div>

                            {/* Title & Tagline */}
                            <div className="space-y-1">
                              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center justify-between">
                                  <span>{language === 'en' ? pkg.nameEn : pkg.nameHi}</span>
                                <span className="text-[10px] font-mono font-bold text-[#C59B27] px-2 py-0.5 bg-amber-50 rounded-md border border-amber-100 shrink-0 ml-1">
                                  {language === 'en' ? pkg.durationEn.split(' ')[0] : pkg.durationHi.split(' ')[0]} {language === 'en' ? 'Days' : 'दिन'}
                                </span>
                              </h3>
                              <p className="text-[11px] font-semibold text-emerald-800 leading-normal">{language === 'en' ? pkg.taglineEn : pkg.taglineHi}</p>
                            </div>

                            {/* Highlighted pricing badge */}
                            <div className="my-3 p-2.5 rounded-xl bg-orange-50/70 border border-orange-100/60 flex items-center justify-between">
                              <span className="text-[11px] text-orange-950 font-serif font-extrabold flex items-center space-x-1">
                                <BadgeCent className="h-3.5 w-3.5 text-orange-700 shrink-0" />
                                <span className="tracking-tight">{language === 'en' ? pkg.priceBadgeEn : pkg.priceBadgeHi}</span>
                              </span>
                              <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-400">
                                {language === 'en' ? '-Flat' : '-छूूट'}
                              </span>
                            </div>

                            <p className="text-stone-600 text-xs leading-relaxed mb-4">
                              {language === 'en' ? pkg.descriptionEn : pkg.descriptionHi}
                            </p>

                            {/* Checklist of Services included */}
                            <div className="space-y-2 mb-5">
                              <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#a16207] font-mono">
                                {language === 'en' ? 'Benefits & Inclusions:' : 'पैकेज के मुख्य लाभ:'}
                              </p>
                              <ul className="space-y-1.5">
                                {(language === 'en' ? pkg.includesEn : pkg.includesHi).map((item, idx) => (
                                  <li key={idx} className="flex items-start space-x-1.5 text-xs text-stone-750">
                                    <div className="p-0.5 rounded-full bg-amber-50 border border-amber-200 mt-0.5 shrink-0">
                                      <Check className="h-2.5 w-2.5 text-emerald-800" />
                                    </div>
                                    <span className="leading-tight text-[11px]">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Interactive Buttons */}
                          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
                            <button
                              onClick={() => onOpenBookingWithService(pkg.id)}
                              className="w-full py-2.5 px-3 bg-emerald-800 hover:bg-emerald-955 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-xs active:scale-95 cursor-pointer text-center"
                            >
                              {language === 'en' ? 'Book Consultation' : 'कार्यक्रम बुक करें'}
                            </button>
                            <button
                              onClick={() => handleOpenDetail(pkg)}
                              className="w-full py-2.5 px-3 border border-stone-200 hover:border-[#C59B27] hover:text-[#C59B27] text-stone-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer bg-stone-50/50 hover:bg-white text-center"
                            >
                              {language === 'en' ? 'Know More' : 'विवरण जानें'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Gentle medical disclaimer (required postnatal advice from standard list) */}
        <section className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 flex items-start space-x-3.5 max-w-4xl mx-auto shadow-inner" id="medical-disclaimer-card">
          <Info className="h-5.5 w-5.5 text-rose-600 mt-0.5 shrink-0" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-stone-900 block font-serif text-sm">
              🚨 {language === 'en' ? 'Critical Postnatal Precaution Advisories' : 'आवश्यक प्रसवोत्तर सुरक्षा परामर्श निर्देश (वैद्यकीय सूचना)'}
            </span>
            <span className="text-stone-605 block leading-relaxed">
              {language === 'en'
                ? 'All therapeutic touch strokes and massage pressures are aligned to pediatric osteopathy parameters. For extremely early postpartum stages under 14 days, normal-diet schedules are verified before implementing core pelvic massage sessions. If you have active medical conditions, check in with our doctor on board at no additional charge.'
                : 'हमारे केंद्र की सभी मालिश पद्धतियां समकालीन सुरक्षा मानकों और पारंपरिक चिकित्सा के अनुसार तैयार की गई हैं। प्रसव के तुरंत बाद (१४ दिन से पहले) सघन शारीरिक मालिश के स्थान पर स्तनपान लैच सुधारना तथा माता को रीढ़ की जकड़न से बचाना हमारी सर्वोच्च प्राथमिकता है।'}
            </span>
          </div>
        </section>

      </div>

      {/* ================= DETAILED "KNOW MORE" BROCHURE MODAL ================= */}
      <AnimatePresence>
        {selectedDetailPackage && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs" id="package-brochure-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#C59B27]/40 flex flex-col max-h-[90vh]"
            >
              
              {/* Modal Banner Image */}
              <div className="relative h-48 sm:h-56 shrink-0 bg-stone-100">
                <img
                  src={selectedDetailPackage.image}
                  alt={language === 'en' ? selectedDetailPackage.nameEn : selectedDetailPackage.nameHi}
                  className="w-full h-full object-cover"
                />
                {/* Gradient shading */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />
                
                {/* Back button */}
                <button
                  onClick={handleCloseDetail}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-md cursor-pointer transition-all border border-white/20"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Overlaid Title */}
                <div className="absolute bottom-4 left-6 space-y-0.5">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#FFE082] px-2 py-0.5 bg-yellow-905/65 rounded-full border border-yellow-500/30">
                    {language === 'en' ? selectedDetailPackage.durationEn : selectedDetailPackage.durationHi}
                  </span>
                  <h3 className="font-serif text-2.5xl sm:text-3xl font-bold text-white tracking-tight">
                    {language === 'en' ? selectedDetailPackage.nameEn : selectedDetailPackage.nameHi}
                  </h3>
                </div>
              </div>

              {/* Modal Body Scroll Area */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm leading-relaxed text-stone-700 bg-[#FDFBF9]">
                
                {/* Intro pitch */}
                <div className="space-y-1.5 border-l-2 border-[#C59B27] pl-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C59B27] font-bold">
                    {language === 'en' ? 'Programme Orientation' : 'कार्यक्रम की रूपरेखा:'}
                  </span>
                  <p className="text-stone-900 font-serif font-bold text-sm sm:text-base leading-tight">
                    {language === 'en' ? selectedDetailPackage.taglineEn : selectedDetailPackage.taglineHi}
                  </p>
                  <p className="text-stone-500 text-xs">
                    {language === 'en' ? selectedDetailPackage.descriptionEn : selectedDetailPackage.descriptionHi}
                  </p>
                </div>

                {/* Highlighted starts at price */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/50 flex justify-between items-center">
                  <div className="space-y-0.5 leading-none">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 font-mono block">
                      {language === 'en' ? 'Exclusive Promotional Value:' : 'विशेष रियायती शुल्क:'}
                    </span>
                    <span className="text-serif font-black text-xl text-[#8A6D1C]">
                      {language === 'en' ? selectedDetailPackage.priceBadgeEn : selectedDetailPackage.priceBadgeHi}
                    </span>
                  </div>
                  <span className="flex items-center space-x-1.5 shrink-0 bg-yellow-101 hover:bg-yellow-250 text-amber-950 border border-yellow-200 rounded-full px-3 py-1 text-[11px] font-bold font-serif shadow-xs">
                    <Star className="h-3 w-3 fill-[#C59B27] text-[#C59B27]" />
                    <span>{language === 'en' ? 'Ayurveda Certified' : 'आयुष अनुशंसित'}</span>
                  </span>
                </div>

                {/* Package Inclusions Detailed Checklist */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#a16207] font-mono block">
                    📋 {language === 'en' ? 'Included Medical & Traditional Services' : 'नैदानिक एवं व्यावहारिक सत्रों का विवरण'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(language === 'en' ? selectedDetailPackage.includesEn : selectedDetailPackage.includesHi).map((inc, iIdx) => (
                      <div key={iIdx} className="flex items-start space-x-2 p-2.5 rounded-xl bg-white border border-stone-200">
                        <Check className="h-4 w-4 text-emerald-800 mt-0.5 shrink-0" />
                        <span className="text-stone-850 font-medium leading-normal text-xs">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extended structured Day descriptions or notes representing premium details */}
                <div className="space-y-2 pt-2 border-t border-stone-200/60 text-xs text-stone-500 bg-white p-4.5 rounded-2xl border border-stone-150">
                  <span className="text-[#C59B27] font-serif font-bold uppercase tracking-wider block">
                    ✨ {language === 'en' ? 'Clinical Methodology & Logistics' : 'अनुपम सूतिका अनुभव एवं व्यावहारिक व्यवस्था'}
                  </span>
                  <ul className="space-y-2 list-none">
                    {(language === 'en' ? selectedDetailPackage.extendedDetailsEn : selectedDetailPackage.extendedDetailsHi).map((line, kIdx) => (
                      <li key={kIdx} className="flex items-start space-x-2">
                        <Sparkle className="h-3 h-3 text-[#C59B27] mt-1 shrink-0" />
                        <span className="leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] italic mt-2 text-stone-400">
                    {language === 'en' 
                      ? '*Traditional materials (Kerala oils, organic herbs, cotton stomach wrap bandages) are transported on visit-day by our therapist at no extra cost.'
                      : '*समस्त आवश्यक वस्तुएं (केरल से आयातित तेल, जैविक जड़ी-बूटियां, कॉटन पेट बांधने की पट्टियां) हमारा थेरेपिस्ट विजिट के समय अपने साथ लाता है। कोई अतिरिक्त शुल्क देय नहीं है।'}
                  </p>
                </div>

              </div>

              {/* Modal Footer Controls */}
              <div className="p-6 border-t border-stone-150 bg-stone-50 flex gap-4 shrink-0 justify-end">
                <button
                  onClick={handleCloseDetail}
                  className="py-2.5 px-5 border border-stone-200 hover:border-stone-300 text-stone-605 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors bg-white hover:bg-stone-50"
                >
                  {language === 'en' ? 'Close Brochure' : 'वापस जाएँ'}
                </button>
                <button
                  onClick={() => {
                    handleCloseDetail();
                    onOpenBookingWithService(selectedDetailPackage.id);
                  }}
                  className="py-2.5 px-6 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-xs active:scale-95 cursor-pointer text-center"
                >
                  {language === 'en' ? 'Secure This Programme' : 'कार्यक्रम आरक्षित करें'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
