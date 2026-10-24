import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  Heart,
  ChevronRight,
  ShieldCheck,
  Calendar,
  MessageCircle,
  Activity,
  Layers,
  ArrowRight,
  Clock,
  Sparkle,
  PhoneCall
} from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'booking' | 'tab' | 'whatsapp';
    serviceId?: string;
    tab?: string;
    icon?: any;
  }[];
}

interface ChatBotProps {
  onNavigateToTab: (tab: string) => void;
  onOpenBookingWithService: (serviceId: string) => void;
}

const QUICK_TOPICS = [
  {
    id: 'packages',
    labelEn: '🌸 Packages & Pricing',
    labelHi: '🌸 पैकेज और शुल्क',
    promptEn: 'What packages do you offer and what are their prices?',
    promptHi: 'आपके पास कौन से केयर पैकेजेस हैं और उनकी कीमतें क्या हैं?'
  },
  {
    id: 'csection',
    labelEn: '🩹 C-Section Stitches Safety',
    labelHi: '🩹 सिजेरियन टांके सुरक्षा',
    promptEn: 'Is your massage safe for C-section stitches and when can I start?',
    promptHi: 'क्या आपकी मालिश सी-सेक्शन टांकों के लिए सुरक्षित है और यह कब शुरू हो सकती है?'
  },
  {
    id: 'lactation',
    labelEn: '🍼 Lactation & Feeding Help',
    labelHi: '🍼 स्तनपान व लैक्टेशन सहायता',
    promptEn: 'How does your lactation counseling and baby latching support work?',
    promptHi: 'स्तनपान और सही लैचिंग के लिए आपकी टीम क्या सहायता देती है?'
  },
  {
    id: 'hygiene',
    labelEn: '🧼 Home Hygiene & Protocols',
    labelHi: '🧼 घर पर स्वच्छता प्रोटोकॉल',
    promptEn: 'How do your therapists ensure hygiene and sterilization during home visits?',
    promptHi: 'होम विजिट के दौरान आपके चिकित्सक स्वच्छता और स्टेरिलाइजेशन कैसे सुनिश्चित करते हैं?'
  },
  {
    id: 'area',
    labelEn: '📍 Raipur, Bhilai & Durg',
    labelHi: '📍 रायपुर - भिलाई - दुर्ग',
    promptEn: 'Where are your services available and how do home visits work?',
    promptHi: 'आपकी सेवाएं किन शहरों में उपलब्ध हैं और होम विजिट की प्रक्रिया क्या है?'
  },
  {
    id: 'coupons',
    labelEn: '🎟️ Active Discount Codes',
    labelHi: '🎟️ छूट और कूपन कोड',
    promptEn: 'What discount coupons and offers are available right now?',
    promptHi: 'वर्तमान में कौन-से डिस्काउंट कूपन और ऑफर्स उपलब्ध हैं?'
  }
];

export default function ChatBot({ onNavigateToTab, onOpenBookingWithService }: ChatBotProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasUnreadIndicator, setHasUnreadIndicator] = useState<boolean>(true);

  // Initial welcome message
  const getInitialMessages = (): Message[] => [
    {
      id: 'init-1',
      role: 'assistant',
      text:
        language === 'en'
          ? "Namaste! 🙏 I am your **MaatriSparsh Care Companion**.\n\nI can assist you with all questions about our **Normal Delivery & C-Section Recovery Packages**, traditional Sutika Abhyanga, infant massage rituals, lactation counseling, and home visits in **Raipur, Bhilai, and Durg**.\n\nHow can I care for you and your newborn today?"
          : "नमस्ते! 🙏 मैं आपकी **मातृस्पर्श केयर सहायिका** हूँ।\n\nमैं **नॉर्मल डिलीवरी व सी-सेक्शन पैकेजेस**, पारंपरिक सूतिका अभ्यंग, शिशु मालिश, स्तनपान परामर्श और **रायपुर, भिलाई व दुर्ग** में होम विजिट से जुड़ी हर जानकारी में आपकी सहायता कर सकती हूँ।\n\nआज मैं आपके और आपके नन्हे शिशु के स्वास्थ्य के लिए क्या जानकारी प्रदान करूँ?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        {
          label: language === 'en' ? 'Normal vs LSCS Packages' : 'नॉर्मल व सिजेरियन पैकेजेस',
          actionType: 'tab',
          tab: 'services'
        },
        {
          label: language === 'en' ? 'Book Sukoon Saptah (₹9,999)' : 'सुकून सप्ताह बुक करें (₹9,999)',
          actionType: 'booking',
          serviceId: 'normal-sukoon-7'
        }
      ]
    }
  ];

  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnreadIndicator(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isOpen, messages]);

  // Knowledge base helper for instant fallback and suggested action detection
  const generateActionsForQuery = (text: string) => {
    const lower = text.toLowerCase();
    const actions: Message['suggestedActions'] = [];

    if (lower.includes('c-section') || lower.includes('lscs') || lower.includes('सिजेरियन') || lower.includes('stitch')) {
      actions.push({
        label: language === 'en' ? 'Book Navya LSCS Care (₹5,999)' : 'नव्या सिजेरियन केयर बुक करें',
        actionType: 'booking',
        serviceId: 'lscs-navya-4'
      });
      actions.push({
        label: language === 'en' ? 'Sukoon Saptah LSCS (₹10,999)' : 'सुकून सप्ताह LSCS बुक करें',
        actionType: 'booking',
        serviceId: 'lscs-sukoon-7'
      });
    } else if (lower.includes('normal') || lower.includes('sukoon') || lower.includes('puran') || lower.includes('नॉर्मल') || lower.includes('price')) {
      actions.push({
        label: language === 'en' ? 'Book Sukoon Saptah (₹9,999)' : 'सुकून सप्ताह बुक करें',
        actionType: 'booking',
        serviceId: 'normal-sukoon-7'
      });
      actions.push({
        label: language === 'en' ? 'Puran Aarohan 14 Days (₹19,999)' : 'पूर्ण आरोहण बुक करें (14 दिन)',
        actionType: 'booking',
        serviceId: 'normal-puran-14'
      });
    }

    actions.push({
      label: language === 'en' ? 'Explore All Programmes' : 'सभी केयर पैकेजेस देखें',
      actionType: 'tab',
      tab: 'services'
    });

    actions.push({
      label: language === 'en' ? 'WhatsApp Sanctum Hotline' : 'व्हाट्सएप्प पर बात करें',
      actionType: 'whatsapp'
    });

    return actions;
  };

  const handleSendMessage = async (userTextToSend?: string) => {
    const text = (userTextToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call full-stack backend endpoint /api/chat which uses GoogleGenAI gemini-3.8-flash with fallback
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.text })),
          language: language
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || '';

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: generateActionsForQuery(text + ' ' + reply)
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.warn('Network chat error, triggering high-fidelity local maternal responder:', error);
      
      // Resilient client-side intelligence responder
      const lower = text.toLowerCase();
      let fallbackReply = '';

      if (lower.includes('c-section') || lower.includes('lscs') || lower.includes('stitch') || lower.includes('टांक') || lower.includes('सिजेरियन')) {
        fallbackReply =
          language === 'en'
            ? "🌸 **C-Section & Incision Safety:**\n\nYes, absolutely safe! Our certified therapists never apply direct pressure or traction on healing surgical incisions.\n\n• **When can you start?** Gentle sessions begin 14 to 21 days post-delivery once your obstetrician approves surface healing.\n• **Early Focus:** We relieve upper back strain, spinal stiffness from nursing, swollen feet, and lymphatic fluids without any tummy friction.\n• **Specialized Care Packages:** Navya Recovery (4 Days - ₹5,999), Sukoon Saptah LSCS (7 Days - ₹10,999), and Puran Aarohan LSCS (14 Days - ₹21,999)."
            : "🌸 **सी-सेक्शन (LSCS) टांकों की सुरक्षा:**\n\nहाँ, यह पूरी तरह सुरक्षित है! हमारे प्रमाणित चिकित्सक टांकों (चीरे) के आसपास कभी भी सीधा दबाव नहीं डालते।\n\n• **कब शुरू करें?** डॉक्टर की सहमति से डिलीवरी के 14-21 दिनों बाद सत्र सुरक्षित रूप से शुरू किए जाते हैं।\n• **प्रारंभिक ध्यान:** पीठ दर्द, गर्दन की अकड़न, और पैरों की सूजन दूर करना बिना पेट पर कोई खिंचाव डाले।\n• **विशेष पैकेजेस:** नव्या रिकवरी (4 दिन - ₹5,999), सुकून सप्ताह LSCS (7 दिन - ₹10,999) व पूर्ण आरोहण LSCS (14 दिन - ₹21,999)।";
      } else if (lower.includes('price') || lower.includes('package') || lower.includes('cost') || lower.includes('पैकेज') || lower.includes('कीमत')) {
        fallbackReply =
          language === 'en'
            ? "🌿 **MaatriSparsh Care Packages & Pricing:**\n\n**Normal Delivery Care:**\n• **Sukoon Saptah (7 Days):** ₹9,999 — Traditional Sutika Abhyanga, lactation training, newborn bath ritual & vital checks.\n• **Puran Aarohan (14 Days):** ₹19,999 — Deep pelvic alignment, herbal belly binding wrap, nurse home visits & holistic spa.\n\n**C-Section (LSCS) Care:**\n• **Navya Recovery (4 Days):** ₹5,999\n• **Sukoon Saptah LSCS (7 Days):** ₹10,999\n• **Puran Aarohan LSCS (14 Days):** ₹21,999\n\n🎟️ Apply coupon `FESTIVAL20` for flat 20% off at checkout!"
            : "🌿 **मातृस्पर्श केयर पैकेजेस और शुल्क:**\n\n**नॉर्मल डिलीवरी केयर:**\n• **सुकून सप्ताह (7 दिन):** ₹9,999 — पारंपरिक सूतिका मालिश, स्तनपान ट्रेनिंग, शिशु स्नान और वाइटल्स चेक।\n• **पूर्ण आरोहण (14 दिन):** ₹19,999 — सघन मालिश, हर्बल पेट बांधना (बेली बाइंडिंग), नर्स विजिट व होलिस्टिक स्पा।\n\n**सी-सेक्शन (LSCS) केयर:**\n• **नव्या रिकवरी (4 दिन):** ₹5,999\n• **सुकून सप्ताह LSCS (7 दिन):** ₹10,999\n• **पूर्ण आरोहण LSCS (14 दिन):** ₹21,999\n\n🎟️ कूपन कोड `FESTIVAL20` से पाएं 20% तक की छूट!";
      } else if (lower.includes('lactat') || lower.includes('feed') || lower.includes('latch') || lower.includes('स्तनपान')) {
        fallbackReply =
          language === 'en'
            ? "🍼 **Lactation & Newborn Latch Sanctuary:**\n\nLed by Dr. Shreya Joshi (B.A.M.S) and certified lactation educators, we provide:\n\n• Hands-on gentle latch positioning to eliminate nipple soreness.\n• Relief for breast engorgement and clogged ducts using warm herbal compresses.\n• Ayurvedic galactagogue recommendations (fennel, cumin, shatavari, ajwain water recipes).\n\nLactation coaching is included in all our 7-day and 14-day home programmes!"
            : "🍼 **स्तनपान व लैक्टेशन सहायता:**\n\nडॉ. श्रेया जोशी (B.A.M.S) और प्रमाणित लैक्टेशन विशेषज्ञों द्वारा:\n\n• सही और दर्द-मुक्त लैचिंग तकनीक सिखाई जाती है।\n• स्तनों के भारीपन और दर्द के लिए हर्बल सिंकाई।\n• प्राकृतिक रूप से दूध बढ़ाने वाले घरेलू नुस्खे (जीरा, सोंठ, अजवाइन और शतावरी)।\n\nयह सहायता हमारे सभी 7 और 14 दिवसीय पैकेजों में निःशुल्क शामिल है!";
      } else if (lower.includes('area') || lower.includes('city') || lower.includes('raipur') || lower.includes('bhilai') || lower.includes('durg') || lower.includes('रायपुर')) {
        fallbackReply =
          language === 'en'
            ? "📍 **Service Sanctum:**\n\nMaatriSparsh serves families exclusively across **Raipur, Bhilai, and Durg** (Chhattisgarh, India).\n\nOur verified female Sutika therapists arrive directly at your home with sterilized kits, cold-pressed oils, and medical hygiene gear."
            : "📍 **सेवा क्षेत्र:**\n\nमातृस्पर्श की सेवाएं केवल **रायपुर, भिलाई और दुर्ग** (छत्तीसगढ़) में उपलब्ध हैं। हमारे प्रमाणित महिला चिकित्सक सभी आवश्यक स्टेराइल किट्स और कोल्ड-प्रेस्ड तेल लेकर सीधे आपके घर आते हैं।";
      } else if (lower.includes('hygiene') || lower.includes('clean') || lower.includes('स्वच्छता')) {
        fallbackReply =
          language === 'en'
            ? "✨ **Hospital-Grade In-Home Hygiene:**\n\n• Full hand sanitization before entering your room.\n• Therapists wear sterile medical aprons, disposable hairnets, and fresh shoe covers.\n• Brass oil warmers and tools are sterilized in individual sealed single-use packs.\n• 100% pure organic cold-pressed almond, sesame, and herbal oils."
            : "✨ **अस्पताल-ग्रेड स्वच्छता प्रोटोकॉल:**\n\n• घर में प्रवेश से पूर्व पूर्ण सैनिटाइजेशन।\n• चिकित्सक मेडिकल एप्रन, हेड कैप व शू-कवर पहनते हैं।\n• पीतल के तेल पात्र व औजार सीलबंद स्टेराइल किट में लाए जाते हैं।\n• केवल १००% शुद्ध ऑर्गेनिक कोल्ड-प्रेस्ड तेलों का उपयोग किया जाता है।";
      } else if (lower.includes('coupon') || lower.includes('discount') || lower.includes('offer') || lower.includes('कूपन')) {
        fallbackReply =
          language === 'en'
            ? "🎟️ **Active Sanctum Promo Codes:**\n\n• `FESTIVAL20`: Flat 20% off on all care packages (up to ₹1,000 off).\n• `NEWBORN15`: 15% discount on lactation & pediatric services (up to ₹500 off).\n• `SANCTUM500`: Flat ₹500 off on home sessions over ₹2,500."
            : "🎟️ **सक्रिय डिस्काउंट कूपन:**\n\n• `FESTIVAL20`: सभी पैकेजों पर फ्लैट 20% की छूट (अधिकतम ₹1,000)।\n• `NEWBORN15`: लैक्टेशन और बाल स्वास्थ्य पर 15% छूट (अधिकतम ₹500)।\n• `SANCTUM500`: ₹2,500 से अधिक की बुकिंग पर ₹500 की फ्लैट छूट।";
      } else {
        fallbackReply =
          language === 'en'
            ? "Thank you for asking! MaatriSparsh specializes in traditional 40-day postpartum healing (Sutika Paricharya) and modern newborn care. Would you like to review our packages, schedule a free 15-minute consultation, or speak with our care coordinator on WhatsApp?"
            : "पूछने के लिए धन्यवाद! मातृस्पर्श पारंपरिक प्रसवोत्तर देखभाल (सूतिका परिचर्या) और आधुनिक बाल स्वास्थ्य में विशेषज्ञ है। क्या आप हमारे पैकेजेस देखना चाहती हैं, या हमारे विशेषज्ञ से सीधे व्हाट्सएप पर बात करना चाहती हैं?";
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: generateActionsForQuery(text + ' ' + fallbackReply)
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: NonNullable<Message['suggestedActions']>[0]) => {
    if (action.actionType === 'booking') {
      if (action.serviceId) {
        onOpenBookingWithService(action.serviceId);
      } else {
        onNavigateToTab('services');
      }
      setIsOpen(false);
    } else if (action.actionType === 'tab') {
      onNavigateToTab(action.tab || 'services');
      setIsOpen(false);
    } else if (action.actionType === 'whatsapp') {
      window.open('https://wa.me/919183216100', '_blank');
    }
  };

  const handleResetChat = () => {
    setMessages(getInitialMessages());
  };

  // Render markdown-like bold and bullet formatting smoothly
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-[13px] sm:text-sm">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;
          
          // Bullet point
          const isBullet = line.startsWith('• ') || line.startsWith('- ');
          const lineText = isBullet ? line.substring(2) : line;

          // Parse bold markers **word**
          const parts = lineText.split(/(\*\*.*?\*\*)/g);

          return (
            <div key={idx} className={isBullet ? 'flex items-start space-x-2 pl-1' : ''}>
              {isBullet && <span className="text-emerald-700 font-bold shrink-0 mt-0.5">•</span>}
              <div className="flex-1">
                {parts.map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={pIdx} className="font-bold text-stone-900">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                      <code key={pIdx} className="bg-amber-100 text-amber-900 font-mono text-xs px-1.5 py-0.5 rounded font-bold">
                        {part.slice(1, -1)}
                      </code>
                    );
                  }
                  return <span key={pIdx}>{part}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* 
        RIGHT MIDDLE LAUNCHER BUTTON
        Docked on the right side at vertical center (top-1/2 -translate-y-1/2 right-2 sm:right-4)
      */}
      <div 
        className="fixed right-2 sm:right-5 top-1/2 -translate-y-1/2 z-40 select-none"
        id="right-middle-chatbot-launcher"
      >
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={language === 'en' ? 'Open MaatriSparsh AI Care Assistant' : 'मातृस्पर्श AI सहायिका खोलें'}
          whileHover={{ scale: 1.06, x: -3 }}
          whileTap={{ scale: 0.94 }}
          className={`relative group flex items-center shadow-2xl transition-all duration-300 rounded-2xl cursor-pointer p-2 sm:p-2.5 border-2 ${
            isOpen 
              ? 'bg-stone-900 border-amber-400 text-amber-300 shadow-amber-900/30' 
              : 'bg-gradient-to-b from-emerald-900 via-stone-900 to-emerald-950 border-emerald-500/60 hover:border-amber-400 text-white shadow-emerald-950/50'
          }`}
        >
          {/* Pulsing indicator aura */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-stone-900" />
          </span>

          <div className="flex flex-col items-center space-y-1 py-1">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Bot className="h-5 w-5 stroke-[2.5]" />
            </div>

            {/* Vertical orientation text badge */}
            <div className="flex flex-col items-center justify-center pt-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-300 font-serif leading-tight">
                {language === 'en' ? 'AI CARE' : 'AI केयर'}
              </span>
              <span className="text-[8px] font-mono tracking-widest text-emerald-300/80 uppercase">
                {language === 'en' ? 'ASSIST' : 'सहायक'}
              </span>
            </div>

            <div className="pt-0.5">
              <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Hover Tooltip on Left */}
          {!isOpen && (
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none">
              <div className="bg-stone-900 border border-emerald-500/40 text-stone-100 text-xs py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap flex items-center space-x-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-serif font-bold text-amber-300">
                  {language === 'en' ? 'Ask MaatriSparsh AI' : 'मातृस्पर्श AI से पूछें'}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {language === 'en' ? '• Instant Answers' : '• तुरंत उत्तर'}
                </span>
              </div>
            </div>
          )}
        </motion.button>
      </div>

      {/* CHATBOT DRAWER / MODAL WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 w-[95vw] sm:w-[410px] md:w-[430px] h-[85vh] max-h-[660px] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-stone-200/90 flex flex-col overflow-hidden text-stone-800"
            id="right-middle-chatbot-window"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white p-4 sm:p-4.5 border-b border-emerald-800/40 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 text-stone-950 flex items-center justify-center shadow-lg font-bold">
                      <Bot className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-stone-900" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-amber-200 tracking-wide">
                        {language === 'en' ? 'MaatriSparsh Care AI' : 'मातृस्पर्श केयर AI'}
                      </h3>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700/50">
                        {language === 'en' ? 'Active' : 'सक्रिय'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 flex items-center space-x-1 mt-0.5">
                      <span>📍 {language === 'en' ? 'Raipur • Bhilai • Durg Sanctum' : 'रायपुर • भिलाई • दुर्ग'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {/* Reset conversation button */}
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title={language === 'en' ? 'Restart Chat' : 'चैट पुनः शुरू करें'}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  {/* Close window */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chat"
                    className="p-1.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Topic Prompts Bar */}
            <div className="bg-stone-50 border-b border-stone-200/80 py-2 px-3 shrink-0 overflow-x-auto no-scrollbar flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold shrink-0 flex items-center space-x-1">
                <Sparkle className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span>{language === 'en' ? 'Topics:' : 'विषय:'}</span>
              </span>
              {QUICK_TOPICS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => handleSendMessage(language === 'en' ? topic.promptEn : topic.promptHi)}
                  className="shrink-0 text-[11px] font-medium bg-white hover:bg-amber-50 hover:border-amber-300 text-stone-700 hover:text-amber-950 px-2.5 py-1 rounded-full border border-stone-200 transition shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {language === 'en' ? topic.labelEn : topic.labelHi}
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end space-x-2 max-w-[88%] sm:max-w-[85%]">
                      {!isUser && (
                        <div className="h-7 w-7 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0 mb-1 shadow-xs">
                          <Bot className="h-3.5 w-3.5 stroke-[2.5]" />
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-3 shadow-xs ${
                          isUser
                            ? 'bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-br-xs'
                            : 'bg-white border border-stone-200/80 text-stone-850 rounded-bl-xs'
                        }`}
                      >
                        {isUser ? (
                          <p className="text-[13px] sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        ) : (
                          renderFormattedText(msg.text)
                        )}
                        <div
                          className={`text-[9.5px] mt-1.5 font-mono ${
                            isUser ? 'text-emerald-200/80 text-right' : 'text-stone-400'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>

                      {isUser && (
                        <div className="h-7 w-7 rounded-xl bg-stone-300 text-stone-700 flex items-center justify-center shrink-0 mb-1 shadow-xs">
                          <User className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Interactive Action Buttons if assistant offered actions */}
                    {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="ml-9 mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                        {msg.suggestedActions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleActionClick(act)}
                            className={`inline-flex items-center space-x-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition shadow-2xs active:scale-95 cursor-pointer ${
                              act.actionType === 'booking'
                                ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 border-amber-500'
                                : act.actionType === 'whatsapp'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                            }`}
                          >
                            {act.actionType === 'booking' && <Calendar className="h-3 w-3 stroke-[2.5]" />}
                            {act.actionType === 'tab' && <Layers className="h-3 w-3" />}
                            {act.actionType === 'whatsapp' && <MessageCircle className="h-3 w-3" />}
                            <span>{act.label}</span>
                            <ChevronRight className="h-3 w-3 opacity-70" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-end space-x-2">
                  <div className="h-7 w-7 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0 mb-1 shadow-xs">
                    <Bot className="h-3.5 w-3.5 animate-pulse" />
                  </div>
                  <div className="bg-white border border-stone-200/90 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-700 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-emerald-800 animate-bounce" />
                      <span className="text-[11px] text-stone-500 font-mono ml-2">
                        {language === 'en' ? 'Thinking...' : 'उत्तर तैयार हो रहा है...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Contact Hotline Bar */}
            <div className="bg-stone-100/90 border-t border-stone-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-stone-600 shrink-0">
              <span className="flex items-center space-x-1 text-emerald-800 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                <span>{language === 'en' ? 'Hospital-Grade Protocols' : 'अस्पताल-ग्रेड सुरक्षा'}</span>
              </span>
              <a
                href="https://wa.me/919183216100"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-emerald-800 hover:text-emerald-900 font-bold hover:underline"
              >
                <PhoneCall className="h-3 w-3 text-emerald-700" />
                <span>+91 9183216100</span>
              </a>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-stone-200 shrink-0 flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Ask about packages, C-section care, fees...'
                    : 'पैकेजेस, सी-सेक्शन देखभाल या शुल्क के बारे में पूछें...'
                }
                disabled={isLoading}
                className="flex-1 rounded-2xl bg-stone-100 border border-stone-200 px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
                className="h-10 w-10 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 disabled:opacity-40 text-amber-300 flex items-center justify-center transition shadow-md shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 stroke-[2.5]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
