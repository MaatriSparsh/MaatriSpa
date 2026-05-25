import { Leaf, Award, Heart, BadgeCheck, Baby, HeartHandshake, ShieldAlert } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

export default function AboutView() {
  const { language } = useLanguage();

  return (
    <div className="py-12 bg-stone-50" id="about-view">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Intention Hero header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center space-x-1 py-1 px-3 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-100/60 shadow-xs">
            <Heart className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
            <span>
              {language === 'en' ? 'Nurturing Matrescence' : 'मातृत्व का आदर और सत्कार'}
            </span>
          </span>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-stone-900 sm:text-5xl leading-tight">
            {language === 'en' 
              ? 'Where Maternal Comfort Meets Certified Postpartum Education' 
              : 'जहाँ मातृ सुरक्षा और प्रमाणित प्रसवोत्तर मार्गदर्शन मिलते हैं'}
          </h1>
          <div className="h-0.5 w-16 bg-emerald-800 mx-auto rounded-full" />
          <p className="text-stone-650 text-xs sm:text-sm leading-relaxed">
            {language === 'en'
              ? 'MaatriSparsh is more than a counseling circle. We are a sanctuary of specialized postpartum educators, certified lactation consultants, and gentle emotional health advisors devoted entirely to guiding families through the postpartum recovery phase with clarity and warmth.'
              : 'मातृस्पर्श एक मार्गदर्शक परामर्श केंद्र है। हम प्रमाणित प्रसवोत्तर परामर्शदाताओं, स्तनपान सलाहकारों और मानसिक स्वास्थ्य सलाहकारों का एक समूह हैं जो नई माताओं को शुरुआती कठिन हफ्तों में सही और सुरक्षित मार्गदर्शन देने के लिए समर्पित हैं।'}
          </p>
        </section>

        {/* Post-natal Philosophy & Science Section */}
        <section className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs">
          <div className="space-y-5">
            <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-[#a16207]">
              {language === 'en' ? 'The Supportive Postnatal Phase' : 'प्रसवोत्तर नाजुक मार्ग दर्शन चरण'}
            </span>
            <h2 className="text-xl sm:text-2.5xl font-bold font-serif text-stone-950 leading-tight">
              {language === 'en' ? 'Upholding Maternal Health & Recovery' : 'माँ का स्वास्थ्य और प्राकृतिक शारीरिक सुदृढ़ता'}
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {language === 'en' 
                ? 'The period immediately following childbirth is a highly sensitive milestone. During this delicate phase, mothers and new parents require sound emotional, nutritional, and pediatric sleep scheduling education rather than physical stressors.'
                : 'प्रसव के तुरंत बाद का समय बेहद संवेदनशील होता है। इस नाजुक चरण में माताओं को शारीरिक तनाव के बजाय संतुलित मानसिक संबल, उचित पोषण सलाह और शिशु के सोने-जागने के सही समय के वैज्ञानिक प्रशिक्षण की आवश्यकता होती है।'}
            </p>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {language === 'en'
                ? 'We support this transition through certified coaching—educating on painless breastfeeding latches, comfortable postural adjustments, physical core recovery advice, and wholesome family kitchen preparations. Our goal is to empower mothers to return to their optimal strengths safely and confidently.'
                : 'हम प्रमाणित कोचिंग के माध्यम से इस परिवर्तन का समर्थन करते हैं—दर्द रहित स्तनपान, आरामदायक शारीरिक मुद्रा सुधारने, भीतरी मांसपेशियों की रिकवरी और रसोइयों के लिए पौष्टिक पारंपरिक भोजन बनाने का प्रशिक्षण देते हैं। हमारा उद्देश्य माताओं को सुरक्षित रूप से आत्मनिर्भर बनाना है।'}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <BadgeCheck className="h-5 w-5 text-emerald-800 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-stone-900 block">
                    {language === 'en' ? 'Latching & Placement Excellence' : 'स्तनपान और आरामदायक मुद्राएं'}
                  </span>
                  <span className="text-xs text-stone-500 block">
                    {language === 'en' 
                      ? 'Invaluable one-on-one sessions helping reduce painful engorgements and aligning holds.'
                      : 'स्तनों के भारीपन को कम करने और आरामदायक स्तनपान स्थिति सुनिश्चित करने के व्यक्तिगत सत्र।'}
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BadgeCheck className="h-5 w-5 text-emerald-800 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-stone-900 block">
                    {language === 'en' ? 'Nutritional Wholesomeness Classes' : 'पौष्टिक दैनिक रसोइया प्रशिक्षण'}
                  </span>
                  <span className="text-xs text-stone-500 block">
                    {language === 'en'
                      ? 'Live instruction detailing digestible nutrient recipes that aid maternal vitality.'
                      : 'शरीर को अतिरिक्त ऊर्जा देने वाली आसान प्रसवोत्तर पारंपरिक रेसिपी बनाने का व्यवहारिक वर्ग।'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2.5 rounded-3xl border border-stone-200 bg-stone-100/50" />
            <div className="relative overflow-hidden rounded-2xl shadow-md border border-stone-200 bg-white">
              <img
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80"
                alt="Nutritional consultation and supportive lactation workspace"
                className="w-full h-[280.5px] sm:h-[320px] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

        {/* Our Care Standards & Promises List */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2.5xl font-bold text-stone-905 font-serif">
              {language === 'en' ? 'Our Educational & Care Frameworks' : 'हमारे नैदानिक ​​और सुरक्षा मानक'}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              {language === 'en'
                ? 'We maintain absolute clarity, safety, and physical empathy in all maternal supportive sessions.'
                : 'हम सभी संवेदी और प्रसवोत्तर परामर्श सत्रों में पूर्ण शुद्धता, स्वच्छता और सुरक्षा मानको का पालन करते हैं।'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[
              {
                icon: Leaf,
                title: language === 'en' ? "Pure Kitchen Nutrition" : "पारंपरिक पौष्टिक आहार",
                desc: language === 'en' 
                  ? "We detail clean whole wheat and natural ingredient kitchen plans that avoid any preservatives or chemical additives."
                  : "हम बिना किसी प्रिजर्वेटिव और रसायनों के शुद्ध पारंपरिक पौष्टिक खाद्य पदार्थों के सही उपयोग की योजना व विधियां बताते हैं।",
                colorBg: "bg-emerald-50",
                colorText: "text-emerald-800"
              },
              {
                icon: Baby,
                title: language === 'en' ? "Infant Care & Sleep Coaching" : "शिशु सोने और जागने के तरीके",
                desc: language === 'en'
                  ? "Gentle pediatric sleep training patterns suited to baby structural comfort and respiratory protection."
                  : "शिशुओं के सुरक्षित श्वास लेने, आरामदायक पोस्चर और नींद के सही चक्र को निर्धारित करने वाला बाल स्वास्थ्य परामर्श।",
                colorBg: "bg-rose-50",
                colorText: "text-rose-650"
              },
              {
                icon: HeartHandshake,
                title: language === 'en' ? "Empathetic Comfort Circles" : "सहानुभूतिपूर्ण भावनात्मक संबल",
                desc: language === 'en'
                  ? "We prioritize the mother's continuous maternal wellness, psychological comfort, and complete local privacy."
                  : "हम माताओं के मानसिक आराम, गोपनीयता और भावनात्मक संबल को निरंतर अपनी सर्वोच्च प्राथमिकता पर रखते हैं।",
                colorBg: "bg-amber-50",
                colorText: "text-[#a16207]"
              },
              {
                icon: ShieldAlert,
                title: language === 'en' ? "Lactation Professional Oversight" : "प्रमाणित विशेषज्ञ मार्गदर्शन",
                desc: language === 'en'
                  ? "Breastfeeding latch alignments run by compassionate educators certified in contemporary pediatric protocols."
                  : "स्तनपान और कोमल शिशु देखभाल मार्गदर्शन पूरी तरह से आधुनिक वैज्ञानिक मानकों के अनुरूप बोर्ड-प्रमाणित सलाहकारों द्वारा आयोजित होता है।",
                colorBg: "bg-stone-100",
                colorText: "text-stone-800"
              }
            ].map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-xs"
              >
                <div className={`p-2.5 rounded-xl inline-block ${p.colorBg} ${p.colorText}`}>
                  <p.icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 font-serif">{p.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
