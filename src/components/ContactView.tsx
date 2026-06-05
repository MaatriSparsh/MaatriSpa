import { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, CheckCircle, Clock, Heart, HelpCircle, PhoneCall, Send, AlertTriangle, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface ContactFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  babyAge: string;
  postnatalState: string;
  message: string;
}

export default function ContactView() {
  const { language } = useLanguage();

  const [form, setForm] = useState<ContactFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    babyAge: '',
    postnatalState: 'early', // early, late, pregnant
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.phone || !form.message) {
      setErrorText(
        language === 'en' 
          ? 'Please supply your name, email, telephone, and details of your request.' 
          : 'कृपया अपना नाम, ईमेल, संपर्क नंबर और संदेश फ़ील्ड अवश्य भरें।'
      );
      return;
    }
    setErrorText('');
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      babyAge: '',
      postnatalState: 'early',
      message: '',
    });
    setSubmitted(false);
  };

  const faqs = [
    {
      q: language === 'en' 
        ? "When can I begin Sutika Abhyanga (massage) after a C-Section?" 
        : "सिजेरियन डिलीवरी (C-Section) के कितने दिनों बाद सूतिका मालिश शुरू हो सकती है?",
      a: language === 'en'
        ? "For vaginal births, gentle abdominal massages can start within 5-7 days. For Cesarean births, we recommend waiting 14 to 21 days for physical wound healing, and avoiding direct intense underbelly massage. We focus instead on back, leg, and neck relief during early weeks."
        : "सामान्य प्रसव के लिए, ५ से ७ दिनों के भीतर कोमल पेट की मालिश शुरू की जा सकती है। जबकि सिजेरियन प्रसव (C-Section) के मामलों में, हम टांके ठीक होने के लिए १४ से २१ दिनों तक प्रतीक्षा करने की सलाह देते हैं और पेट के निचले हिस्से पर सीधे अत्यधिक दबाव से बचते हैं। शुरुआती हफ्तों में हम इसके बजाय पीठ, पैरों और गर्दन के दर्द से राहत देने पर ध्यान केंद्रित करते हैं।"
    },
    {
      q: language === 'en'
        ? "Are the massage oils safe for newborn baby skin?"
        : "क्या मालिश के लिए प्रयुक्त तेल नवजात शिशु की संवेदनशील त्वचा के लिए सुरक्षित हैं?",
      a: language === 'en'
        ? "Absolutely. We utilize exclusively cold-pressed organic sesame or coconut oils infused with mild traditional safe herbs (such as Bala or Ashwagandha root). They contain zero synthetic chemicals, fragrances, parabens, or heavy elements."
        : "बिल्कुल। हम केवल शुद्ध कोल्ड-प्रेस्ड जैविक तिल या नारियल तेलों का उपयोग करते हैं, जिनमें बहुत सौम्य प्राकृतिक जड़ी-बूटियों (जैसे बला या अश्वगंधा जड़) का अर्क मिलाया जाता है। इनमें कोई कृत्रिम रसायन, भारी तत्व या कृत्रिम सुगंध नहीं होती।"
    },
    {
      q: language === 'en'
        ? "Do you supply the belly binder wrap bands and medicated water?"
        : "क्या आपके पैकेज में बेली बाइंडिंग कपड़ा (पेट बांधने की पट्टी) और औषधीय जल शामिल है?",
      a: language === 'en'
        ? "Yes! All MaatriSparsh home care sessions are fully inclusive. Our specialist brings sterilized organic cotton belly wrapping wraps, the necessary medicated oil decanters, and herbal Snana wash baths to prepare of your newborn."
        : "हाँ! मातृस्पर्श के सभी होम केयर पैकेज पूर्ण रूप से समावेशी हैं। हमारे विशेषज्ञ थेरेपिस्ट अपने साथ रोगाणुरहित (Sterilized) सूती कपड़ा बेली रैप, आवश्यक औषधीय तेल, और नवजात शिशु के स्नान के लिए विशेष उबटन व जड़ी-बूटी स्नान सामग्री लेकर आते हैं।"
    },
    {
      q: language === 'en'
        ? "Do your lactation pediatricians travel for urgent home-calls?"
        : "क्या आपके स्तनपान और बाल रोग सलाहकार आपातकालीन होम-विजिट पर आते हैं?",
      a: language === 'en'
        ? "Yes. All breastfeeding, nursing latching consultations, and infant colic assessment remedies can be scheduled as an comfortable in-home visit or at our warm clinic sanctum."
        : "जी हाँ। स्तनपान सुधारने, बच्चे के लैचिंग संरेखण और शिशु के तेज पेट दर्द के आपातकालीन उपचार के लिए हमारे योग्य सलाहकार आपके घर पर आकर मार्गदर्शन दे सकते हैं।"
    }
  ];

  return (
    <div className="py-12 bg-stone-50" id="contact-view">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header coordinate text block */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#a16207] font-mono block">
            {language === 'en' ? 'Inquire & Connect' : 'हमसे संपर्क करें'}
          </span>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
            {language === 'en' ? 'Whisper Your Postnatal Concerns' : 'अपनी प्रसवोत्तर चिंताओं को हमसे साझा करें'}
          </h1>
          <div className="h-0.5 w-16 bg-emerald-800 mx-auto rounded-full" />
          <p className="text-stone-500 text-xs sm:text-sm">
            {language === 'en' 
              ? 'Reach our clinical pediatric line or schedule a consultation with a traditional Sutika masseuse.'
              : 'हमारे आपातकालीन शिशु स्वास्थ्य सेवा नंबर पर कॉल करें अथवा विशेषज्ञ सूतिका थेरेपिस्ट से परामर्श सत्र तय करें।'}
          </p>
        </section>

        {/* Emergency Lactation Alert banner representing real-world empathetic care */}
        <section className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <PhoneCall className="h-6 w-6 text-red-600 mt-0.5 shrink-0 animate-bounce" />
            <div className="space-y-1">
              <span className="font-serif text-base font-bold text-stone-900 block">
                {language === 'en' ? 'Acute Breastfeeding or Colic Crisis Hotline' : 'तीव्र स्तनपान दर्द अथवा शिशु रोदन आपातकालीन हेल्पलाइन'}
              </span>
              <span className="text-xs text-stone-600 block leading-relaxed">
                {language === 'en'
                  ? 'Struggling with high infant fever, blocked lactation duct pain/engorgement, or round-the-clock crying? Registered mothers access absolute support instantly.'
                  : 'स्तनों में भारीपन, टांके के तेज दर्द या शिशु के लगातार घंटो रोने से चिंतित हैं? पंजीकृत माताओं के लिए तत्काल प्रसवोत्तर दाई चिकित्सा सहायता उपलब्ध है।'}
              </span>
            </div>
          </div>
          <div className="bg-white px-4 py-2 border border-red-200 rounded-xl text-center shrink-0">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-bold leading-none mb-1">
              {language === 'en' ? '24/7 Priority Emergency' : '२४/७ आपातकालीन नंबर'}
            </span>
            <span className="font-serif font-black text-red-650 text-sm sm:text-base">+91 9183216100</span>
          </div>
        </section>

        {/* Contact Coordinates Columns & Submission Form */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          
          {/* Coordinates Details Column Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
                {language === 'en' ? 'MaatriSparsh Sanctum Address' : 'मातृस्पर्श केंद्र संपर्क विवरणी'}
              </h3>

              <div className="space-y-5">
                <div className="flex items-start space-x-3 text-stone-600">
                  <MapPin className="h-5.5 w-5.5 text-emerald-800 mt-0.5 shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-stone-900 block">
                      {language === 'en' ? 'Physical Sanctum Clinic' : 'मुख्य मातृत्व केंद्र'}
                    </strong>
                    <span>Unit 2. Govind Kunj, 1st floor, near icici bank, civil lines, Raipur, Chhattishgarg, 492001</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-stone-600">
                  <Phone className="h-5.5 w-5.5 text-emerald-805 mt-0.5 shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-stone-900 block">
                      {language === 'en' ? 'Telephone Inquiries' : 'टेलीफोन पूछताछ नंबर'}
                    </strong>
                    <span>+91 9183216100</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-stone-600">
                  <Mail className="h-5.5 w-5.5 text-emerald-805 mt-0.5 shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-stone-900 block">
                      {language === 'en' ? 'Support Email' : 'ईमेल पता'}
                    </strong>
                    <span className="break-all">care@maatrisparsh.com</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-stone-600">
                  <Clock className="h-5.5 w-5.5 text-emerald-850 mt-0.5 shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-stone-900 block">
                      {language === 'en' ? 'General Working Hours' : 'परामर्श समय सूची'}
                    </strong>
                    <span>Mon - Sat: 08:30 AM — 06:00 PM</span>
                    <span className="block text-[11px] text-[#a16207] font-mono mt-0.5">
                      {language === 'en' ? '*Holidays closed except emergencies' : '*रविवार छुट्टी - आपातकालीन सेवाएं खुली हैं'}
                    </span>
                  </div>
                </div>

                {/* Premium social communication channels */}
                <div className="border-t border-stone-100 pt-5 mt-3 space-y-3.5">
                  <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                    {language === 'en' ? 'Official Social Circles' : 'आधिकारिक सामाजिक क्षेत्र'}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <a
                      href="https://wa.me/919183216100"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Chat with MaatriSparsh on WhatsApp"
                      className="group flex flex-col items-center justify-center p-3.5 rounded-2xl border border-stone-100 bg-[#FFFCFB] hover:bg-emerald-50/50 hover:border-emerald-250 transition-all duration-300 hover:shadow-xs text-center cursor-pointer"
                    >
                      <span className="p-2 rounded-full bg-emerald-50 text-emerald-800 group-hover:scale-110 transition-transform shadow-2xs">
                        <MessageCircle className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-[11px] font-bold text-stone-900 mt-2">WhatsApp</span>
                      <span className="text-[9px] text-stone-500 font-mono mt-0.5">+91 9183216100</span>
                    </a>

                    <a
                      href="https://www.facebook.com/profile.php?id=61572016331977"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Visit MaatriSparsh on Facebook"
                      className="group flex flex-col items-center justify-center p-3.5 rounded-2xl border border-stone-100 bg-[#FFFCFB] hover:bg-blue-50/50 hover:border-blue-250 transition-all duration-300 hover:shadow-xs text-center cursor-pointer"
                    >
                      <span className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform shadow-2xs">
                        <Facebook className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-[11px] font-bold text-stone-900 mt-2">Facebook</span>
                      <span className="text-[9px] text-stone-500 mt-0.5">MaatriSparsh</span>
                    </a>

                    <a
                      href="https://www.instagram.com/maatrisparsh"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Follow MaatriSparsh on Instagram"
                      className="group flex flex-col items-center justify-center p-3.5 rounded-2xl border border-stone-100 bg-[#FFFCFB] hover:bg-rose-50/50 hover:border-rose-250 transition-all duration-300 hover:shadow-xs text-center cursor-pointer"
                    >
                      <span className="p-2 rounded-full bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform shadow-2xs">
                        <Instagram className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-[11px] font-bold text-stone-900 mt-2">Instagram</span>
                      <span className="text-[9px] text-stone-500 mt-0.5">@maatrisparsh</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950 text-emerald-100 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-805 text-rose-100 shadow-xs">
                <Heart className="h-5 w-5 text-rose-250 animate-pulse" />
              </div>
              <h4 className="font-serif text-lg font-bold text-stone-50">
                {language === 'en' ? 'Our Maternal Mission' : 'हमारा मातृत्व मिशन संकल्प'}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {language === 'en'
                  ? 'Childbirth leaves a mother physically raw and highly vulnerable. Our purpose is to envelop every mother in warm oil comfort, traditional food prep, and scientifically sound lactation methods so she never feels depleted or abandoned on her journey.'
                  : 'प्रसव एक नवजात शिशु और माँ को अत्यंत संवेदनशील और नाजुक स्थिति में छोड़ देता है। हमारा एकमात्र उद्देश्य प्रत्येक नवजात प्रसवा माँ को गर्म समृद्ध तेल मालिश, सर्वोत्तम आहार योजनाओं और वैज्ञानिक स्तनपान तकनीकों से आच्छादित करना है ताकि वे अपनी मातृत्व यात्रा में स्वयं को कभी अकेला महसूस न करें।'}
              </p>
            </div>
          </div>

          {/* Interactive Form Submission Box */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-5 sm:p-7" id="contact-form-card">
            {submitted ? (
              <div className="text-center py-10 space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                  <CheckCircle className="h-8 w-8 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    {language === 'en' ? 'Empathetic Request Logged!' : 'संदेश को सफलतापूर्वक दर्ज कर लिया गया है'}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    {language === 'en' 
                      ? <>Thank you, <strong>{form.firstName} {form.lastName}</strong>. Our lead postnatal clinical coordinator will telephone you at <strong>{form.phone}</strong> inside the next 2 hours to confirm details.</>
                      : <>धन्यवाद, <strong>{form.firstName} {form.lastName}</strong>। मातृत्व समन्वयक आपसे जल्द ही <strong>{form.phone}</strong> पर अगले २ घंटों के भीतर कॉल / व्हाट्सएप के माध्यम से संपर्क करके विस्तृत परामर्श प्रदान करेंगे।</>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-stone-50 px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Submit Another Question' : 'दूसरा प्रश्न पूछें'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" id="contact-form">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    {language === 'en' ? 'Discuss Your Care Plan' : 'प्रसवोत्तर परामर्श और पूछताछ फॉर्म'}
                  </h3>
                  <p className="text-xs text-stone-550 leading-normal">
                    {language === 'en'
                      ? 'Let external midwives know what physical aches, baby colic depth, or nursing questions you currently have.'
                      : 'शरीर के दर्द, शिशु की पाचन समस्या अथवा स्तनपान संबंधी अपनी जिज्ञासाएं हमारे विशेज्ञषों के साथ निसंकोच साझा करें।'}
                  </p>
                </div>

                {errorText && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center space-x-2">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-650" />
                    <span>{errorText}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      {language === 'en' ? 'First Name *' : 'पहला नाम *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="e.g. Karishma"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 px-4 text-xs font-medium focus:border-emerald-850 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      {language === 'en' ? 'Last Name' : 'उपनाम / अंतिम नाम'}
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="e.g. Sharma"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 px-4 text-xs font-medium focus:border-emerald-850 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      {language === 'en' ? 'Your Email Coordinate *' : 'आपका ईमेल आईडी *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="mother@domain.com"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 px-4 text-xs font-medium focus:border-emerald-850 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      {language === 'en' ? 'WhatsApp/Phone Number *' : 'मोबाइल / व्हाट्सएप्प नंबर *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 99999 99999"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 px-4 text-xs font-medium focus:border-emerald-850 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      {language === 'en' ? "Baby's Age" : 'शिशु की वर्तमान आयु'}
                    </label>
                    <input
                      type="text"
                      value={form.babyAge}
                      onChange={(e) => setForm({ ...form, babyAge: e.target.value })}
                      placeholder="e.g. 4 Weeks or 'Expecting'"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 px-4 text-xs font-medium focus:border-emerald-850 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      {language === 'en' ? 'Postpartum Journey Status' : 'वर्तमान शारीरिक अवस्था काल'}
                    </label>
                    <select
                      value={form.postnatalState}
                      onChange={(e) => setForm({ ...form, postnatalState: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 px-4 text-xs font-medium focus:border-emerald-850 focus:bg-white focus:outline-hidden"
                    >
                      <option value="expecting">{language === 'en' ? 'Pregnant / Expecting Soon' : 'गर्भवती (Pregnancy)'}</option>
                      <option value="early">{language === 'en' ? 'Early Postpartum (1-4 Weeks)' : 'शुरुआती समय (१-४ सप्ताह)'}</option>
                      <option value="medium">{language === 'en' ? 'Restoring Period (5-12 Weeks)' : 'मध्यम संक्रमण काल (५-१२ सप्ताह)'}</option>
                      <option value="late">{language === 'en' ? 'Late Postnatal Recovery (3+ Months)' : '३ + महीने प्रसवोत्तर'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    {language === 'en' ? 'Describe somatics, baby gas, or lactation questions *' : 'अपनी समस्याओं व आवश्यकताओं का विवरण साझा करें *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={language === 'en' ? "Describe how we can help you..." : "कमर दर्द, टांके की स्थिति, शिशु का चिड़चिड़ापन, स्तनपान आदि जो भी पूछना चाहें..."}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 px-4 text-xs font-medium focus:border-emerald-850 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 text-stone-50 py-3.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                >
                  <Send className="h-4 w-4 text-rose-200 shrink-0" />
                  <span>{language === 'en' ? 'Send Care Inquiry Message' : 'सलाहकार से समय तय करें'}</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Beautiful FAQ section */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2.5xl font-bold text-stone-900 font-serif">
              {language === 'en' ? 'Postnatal & Newborn FAQ Sanctuary' : 'अक्सर पूछे जाने वाले प्रसवोत्तर सवाल'}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              {language === 'en'
                ? 'Helping families feel secure during sensitive maternal transitions.'
                : 'प्रसवोत्तर संवेदनशील बदलावों के समय परिवारों को वैज्ञानिक मार्गदर्शन और सुरक्षा प्रदान करना।'}
            </p>
          </div>

          <div className="max-w-3xl mx-auto border border-stone-255 bg-white rounded-3xl overflow-hidden shadow-xs divide-y divide-stone-200" id="faqs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="transition-all">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-5 px-6 sm:px-8 flex items-center justify-between text-left cursor-pointer focus:outline-hidden focus:bg-stone-50"
                  >
                    <span className="font-serif text-sm sm:text-base font-bold text-stone-900 pr-4 flex items-start space-x-2.5">
                      <HelpCircle className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
                      <span>{faq.q}</span>
                    </span>
                    <span className="text-emerald-805 font-bold text-lg select-none">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pb-6 px-6 sm:px-8 pl-14 sm:pl-16 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
