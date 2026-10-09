import { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, ShieldCheck, Heart, Sparkle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageProvider';

export interface FAQItem {
  id: string;
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
  badgeEn?: string;
  badgeHi?: string;
}

export const FAQS_DATA: FAQItem[] = [
  {
    id: 'c-section-stitches',
    questionEn: 'Is it safe for C-section stitches?',
    questionHi: 'क्या यह सी-सेक्शन (C-section) के टांकों के लिए सुरक्षित है?',
    badgeEn: 'Surgical Safety',
    badgeHi: 'सर्जिकल सुरक्षा',
    answerEn:
      'Yes, absolutely. Our certified Sutika practitioners follow strict obstetric guidelines. We never perform heavy pressure or direct friction around the incision site during early recovery. For C-section mothers, gentle restorative sessions can safely begin 14 to 21 days post-delivery once your obstetrician confirms preliminary surface healing. During the initial period, therapy focuses primarily on relieving back pain, spinal strain, neck stiffness, swollen legs, and lymphatic fluid drainage while completely protecting the abdominal scar. Specialized scar-safe wraps and gentle abdominal soothing are only introduced with zero-tension techniques once the incision has fully healed.',
    answerHi:
      'हाँ, बिल्कुल सुरक्षित है। हमारे प्रमाणित सूतिका विशेषज्ञ सख्त प्रसूति दिशा-निर्देशों का पालन करते हैं। प्रसवोत्तर शुरुआती दिनों में टांके (चीरे) के आसपास कभी भी भारी दबाव या सीधी मालिश नहीं की जाती। सी-सेक्शन माताओं के लिए, डॉक्टर की सहमति और टांकों के प्राथमिक सूखने के बाद (आमतौर पर डिलीवरी के १४ से २१ दिनों बाद) सत्र सुरक्षित रूप से शुरू किए जा सकते हैं। इस दौरान हमारा पूरा ध्यान पीठ के दर्द, रीढ़ की थकान, गर्दन की अकड़न और पैरों की सूजन दूर करने पर होता है, जिससे टांकों पर कोई खिंचाव नहीं आता।'
  },
  {
    id: 'baby-crying',
    questionEn: 'What happens if my baby cries during the mother massage?',
    questionHi: 'यदि माँ की मालिश के दौरान शिशु रोने लगे तो क्या होता है?',
    badgeEn: 'Baby First Policy',
    badgeHi: 'शिशु प्राथमिक नीति',
    answerEn:
      'Baby comfort always comes first. Our therapists operate under a strict "Baby-First Pause Policy." If your newborn cries, awakens hungry, requires a diaper change, or simply desires a cuddle, the mother\'s session is instantly paused without any rush. You can nurse, soothe, or hold your baby at your own pace. If desired, our certified therapist can also assist with soothing holds, gentle burping positions, or peaceful swaddling while you rest comfortably. Your scheduled session time accommodates these natural newborn breaks so neither mother nor baby feels hurried.',
    answerHi:
      'शिशु का आराम हमारी सर्वोच्च प्राथमिकता है। हमारे चिकित्सक "शिशु-प्रथम विराम नीति" (Baby-First Pause Policy) के तहत काम करते हैं। यदि मालिश के बीच में आपका बच्चा रोने लगता है, भूख से जाग जाता है, या उसे गोद में लेना होता है, तो सत्र को तुरंत बिना किसी जल्दबाजी के रोक दिया जाता है। आप आराम से शिशु को स्तनपान करा सकती हैं या शांत कर सकती हैं। हमारी प्रशिक्षित टीम आपको बच्चे को डकार दिलाने व आरामदायक लपेटने (स्वैडलिंग) में भी मदद करती है।'
  },
  {
    id: 'hygiene-home-visit',
    questionEn: 'How do you maintain hygiene during home visit?',
    questionHi: 'होम विजिट (घर पर सेवा) के दौरान आप स्वच्छता कैसे बनाए रखते हैं?',
    badgeEn: 'Hospital-Grade Protocol',
    badgeHi: 'अस्पताल-ग्रेड स्वच्छता',
    answerEn:
      'We enforce rigorous hospital-grade sanitization protocols for every single in-home visit. Before entering your sanctum, our therapists sanitize thoroughly, put on clean medical-grade aprons, disposable head caps, and fresh indoor footwear or shoe covers. All equipment—including brass oil warmers, traditional decanters, measurement bowls, and organic cotton wrapping wraps—are sterilized and sealed in individual single-use hygiene kits. We use 100% pure, lab-tested organic cold-pressed oils free of synthetic preservatives, and clean disposal practices are strictly observed so your room remains immaculate and fragrant.',
    answerHi:
      'हम प्रत्येक होम विजिट के लिए अस्पताल-ग्रेड स्वच्छता प्रोटोकॉल का सख्ती से पालन करते हैं। आपके घर में प्रवेश करने से पहले हमारे चिकित्सक हाथों को पूरी तरह सैनिटाइज करते हैं, स्वच्छ मेडिकल एप्रन, डिस्पोजेबल हेड कैप और नए इनडोर शू-कवर पहनते हैं। सभी उपकरण, तेल गर्म करने के पात्र और सूती बेली रैपिंग कपड़े रोगाणुरहित (स्टेरिलाइज्ड) सीलबंद किट में लाए जाते हैं। हम केवल १००% शुद्ध, परीक्षण किए गए जैविक कोल्ड-प्रेस्ड तेलों का उपयोग करते हैं, जिससे माँ और नवजात शिशु दोनों संक्रमण से पूरी तरह सुरक्षित रहते हैं।'
  }
];

interface FAQSectionProps {
  className?: string;
  onOpenBooking?: () => void;
}

export default function FAQSection({ className = '', onOpenBooking }: FAQSectionProps) {
  const { language } = useLanguage();
  const [openId, setOpenId] = useState<string | null>('c-section-stitches');

  const toggleQuestion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className={`py-16 sm:py-24 bg-stone-50 border-t border-stone-200/80 ${className}`} id="faq-section">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 py-1 px-3.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-100 shadow-xs">
            <HelpCircle className="h-3.5 w-3.5 text-emerald-700" />
            <span>{language === 'en' ? 'Frequently Asked Questions' : 'अक्सर पूछे जाने वाले सवाल'}</span>
          </div>
          <h2 className="font-serif text-2.5xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {language === 'en' ? 'Clear Answers for Mother & Newborn Safety' : 'माँ और नवजात की सुरक्षा से जुड़े स्पष्ट जवाब'}
          </h2>
          <div className="h-0.5 w-16 bg-emerald-800 mx-auto rounded-full" />
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            {language === 'en'
              ? 'Every mother\'s postpartum healing journey is sacred. Here is how we ensure gentle care, clinical caution, and total comfort in your home.'
              : 'प्रत्येक माँ की प्रसवोत्तर रिकवरी अमूल्य है। जानिए हम आपके घर पर किस प्रकार सौम्य देखभाल, चिकित्सीय सावधानी और पूर्ण स्वच्छता सुनिश्चित करते हैं।'}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4" id="faq-accordions-group">
          {FAQS_DATA.map((faq, index) => {
            const isOpen = openId === faq.id;
            const question = language === 'en' ? faq.questionEn : faq.questionHi;
            const answer = language === 'en' ? faq.answerEn : faq.answerHi;
            const badge = language === 'en' ? faq.badgeEn : faq.badgeHi;

            return (
              <motion.div
                key={faq.id}
                initial={false}
                className={`rounded-2xl transition-all duration-200 border ${
                  isOpen
                    ? 'bg-white border-emerald-800/40 shadow-md ring-1 ring-emerald-800/20'
                    : 'bg-white/80 hover:bg-white border-stone-200/90 shadow-xs'
                }`}
                id={`faq-item-${faq.id}`}
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full py-5 px-5 sm:px-7 flex items-center justify-between text-left cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                    <span
                      className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs sm:text-sm font-bold transition-colors ${
                        isOpen
                          ? 'bg-emerald-800 text-amber-300'
                          : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                      }`}
                    >
                      0{index + 1}
                    </span>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 flex-1">
                      <span className="font-serif text-sm sm:text-base font-bold text-stone-900 leading-snug">
                        {question}
                      </span>
                      {badge && (
                        <span className="inline-flex self-start items-center text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                      isOpen ? 'bg-emerald-100/80 text-emerald-900 rotate-180' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-7 pb-6 pt-1 text-xs sm:text-sm text-stone-650 leading-relaxed border-t border-stone-100 ml-11 sm:ml-13 pr-4 sm:pr-8">
                        <div className="flex items-start gap-2.5 pt-3">
                          <p className="flex-1 leading-relaxed text-stone-700">
                            {answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Help Notice */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg border border-emerald-900/60">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Have a specific medical or recovery question?' : 'क्या आपकी कोई विशेष चिकित्सीय चिंता है?'}</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              {language === 'en'
                ? 'Our certified pediatric and maternal postpartum team provides free 15-minute consultations before any session.'
                : 'हमारी बाल रोग और प्रसवोत्तर परामर्श टीम सत्र से पहले निःशुल्क १५ मिनट का व्यक्तिगत परामर्श उपलब्ध कराती है।'}
            </p>
          </div>
          {onOpenBooking && (
            <button
              onClick={onOpenBooking}
              className="shrink-0 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition hover:scale-105 shadow-md cursor-pointer"
            >
              {language === 'en' ? 'Talk to a Care Consultant' : 'विशेषज्ञ से परामर्श लें'}
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
