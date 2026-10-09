import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Moon, 
  Heart, 
  Smile, 
  Droplet, 
  Calendar, 
  Plus, 
  Sparkles, 
  ChevronRight, 
  Activity, 
  ShieldCheck, 
  Info, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Baby,
  Coffee,
  Lock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from './FirebaseProvider';
import { useLanguage } from './LanguageProvider';
import { 
  WellnessMilestone, 
  InfantMoodType, 
  SleepQualityType, 
  LactationComfortType 
} from '../types';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';

interface WellnessTrackerProps {
  onOpenAuth?: () => void;
  onOpenBooking?: () => void;
}

// Sample fallback dataset for preview/guest and first-time users
const DEFAULT_PREVIEW_DATA: WellnessMilestone[] = [
  {
    id: 'demo-day-1',
    userId: 'demo',
    date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    sleepHours: 5.0,
    sleepQuality: 'Fragmented',
    lactationSessions: 6,
    lactationComfort: 'Tender & Sore',
    infantMood: 'Colicky & Crying',
    infantMoodScore: 2,
    maternalVitality: 2,
    waterGlasses: 6,
    specialMilestones: ['First gentle sponge bath'],
    healingNotes: 'Night was challenging with colic; baby needed continuous soothing.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-day-2',
    userId: 'demo',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    sleepHours: 5.5,
    sleepQuality: 'Fragmented',
    lactationSessions: 7,
    lactationComfort: 'Mild Engorgement',
    infantMood: 'Fussy & Gassy',
    infantMoodScore: 2.5,
    maternalVitality: 3,
    waterGlasses: 7,
    specialMilestones: ['Warm abdominal wrap applied'],
    healingNotes: 'Tried warm fennel tea; infant gas reduced slightly.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-day-3',
    userId: 'demo',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    sleepHours: 6.0,
    sleepQuality: 'Fair',
    lactationSessions: 8,
    lactationComfort: 'Comfortable',
    infantMood: 'Sleepy & Peaceful',
    infantMoodScore: 3.5,
    maternalVitality: 3,
    waterGlasses: 8,
    specialMilestones: ['MaatriSparsh Abhyanga session done'],
    healingNotes: 'Traditional oil massage helped soothe muscle stiffness significantly.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-day-4',
    userId: 'demo',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    sleepHours: 6.8,
    sleepQuality: 'Fair',
    lactationSessions: 8,
    lactationComfort: 'Comfortable',
    infantMood: 'Playful & Alert',
    infantMoodScore: 4,
    maternalVitality: 4,
    waterGlasses: 9,
    specialMilestones: ['Sutika Snana herbal decoction bath', '20-min restorative afternoon nap'],
    healingNotes: 'Baby latched comfortably for 25 minutes; resting much better.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-day-5',
    userId: 'demo',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    sleepHours: 7.2,
    sleepQuality: 'Restful',
    lactationSessions: 9,
    lactationComfort: 'Pain-Free & Smooth',
    infantMood: 'Playful & Alert',
    infantMoodScore: 4.5,
    maternalVitality: 4,
    waterGlasses: 9,
    specialMilestones: ['Gentle pelvic floor breathwork', 'Warm sesame oil foot massage'],
    healingNotes: 'Energy is steadily returning. Feeling more confident with nursing.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-day-6',
    userId: 'demo',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    sleepHours: 7.5,
    sleepQuality: 'Restful',
    lactationSessions: 8,
    lactationComfort: 'Pain-Free & Smooth',
    infantMood: 'Happy & Content',
    infantMoodScore: 5,
    maternalVitality: 5,
    waterGlasses: 10,
    specialMilestones: ['Pelvic belly wrap worn', 'Pediatric latch checkup passed'],
    healingNotes: 'Baby slept 3.5 consecutive hours; woke up smiling and content.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-day-7',
    userId: 'demo',
    date: new Date().toISOString().split('T')[0],
    sleepHours: 8.0,
    sleepQuality: 'Restful',
    lactationSessions: 8,
    lactationComfort: 'Pain-Free & Smooth',
    infantMood: 'Happy & Content',
    infantMoodScore: 5,
    maternalVitality: 5,
    waterGlasses: 10,
    specialMilestones: ['Full Abhyanga session', 'Deep nourishing herbal broth'],
    healingNotes: 'Wonderful restful day; swelling has visibly subsided.',
    createdAt: new Date().toISOString()
  }
];

const RECOVERY_BADGES = [
  'Warm Abhyanga Massage',
  'Sutika Snana Herbal Bath',
  'Postnatal Belly Wrap Worn',
  'Gentle Breathwork / Asana',
  'Restorative Afternoon Nap',
  'Comfortable Latching Flow',
  'Herbal Kashayam Hydration',
  'Pediatric Well-Baby Check'
];

export default function WellnessTracker({ onOpenAuth, onOpenBooking }: WellnessTrackerProps) {
  const { user, userProfile } = useFirebase();
  const { language } = useLanguage();

  const [milestones, setMilestones] = useState<WellnessMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartViewMetric, setChartViewMetric] = useState<'all' | 'sleep' | 'lactation' | 'mood' | 'vitality'>('all');
  const [filterDays, setFilterDays] = useState<number>(7);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formSleepHours, setFormSleepHours] = useState<number>(7.0);
  const [formSleepQuality, setFormSleepQuality] = useState<SleepQualityType>('Restful');
  const [formLactationSessions, setFormLactationSessions] = useState<number>(8);
  const [formLactationComfort, setFormLactationComfort] = useState<LactationComfortType>('Comfortable');
  const [formInfantMood, setFormInfantMood] = useState<InfantMoodType>('Happy & Content');
  const [formInfantMoodScore, setFormInfantMoodScore] = useState<number>(5);
  const [formMaternalVitality, setFormMaternalVitality] = useState<number>(4);
  const [formWaterGlasses, setFormWaterGlasses] = useState<number>(8);
  const [formSelectedMilestones, setFormSelectedMilestones] = useState<string[]>(['Warm Abhyanga Massage']);
  const [formNotes, setFormNotes] = useState<string>('');

  // 1. Sync with Firestore or LocalStorage
  useEffect(() => {
    if (!user) {
      // In guest/preview mode: check localStorage or load demo data
      const localKey = 'maatrisparsh_guest_wellness';
      const saved = localStorage.getItem(localKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMilestones(parsed);
            setLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }
      setMilestones(DEFAULT_PREVIEW_DATA);
      setLoading(false);
      return;
    }

    // When authenticated: listen to Firestore collection
    setLoading(true);
    const localUserKey = `maatrisparsh_wellness_${user.uid}`;
    const cached = localStorage.getItem(localUserKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setMilestones(parsed);
        }
      } catch {
        // ignore
      }
    }

    try {
      const q = query(collection(db, 'wellnessLogs'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loaded: WellnessMilestone[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              id: docSnap.id,
              userId: data.userId,
              date: data.date,
              sleepHours: Number(data.sleepHours) || 0,
              sleepQuality: data.sleepQuality || 'Fair',
              lactationSessions: Number(data.lactationSessions) || 0,
              lactationComfort: data.lactationComfort || 'Comfortable',
              infantMood: data.infantMood || 'Happy & Content',
              infantMoodScore: Number(data.infantMoodScore) || 3,
              maternalVitality: Number(data.maternalVitality) || 3,
              waterGlasses: Number(data.waterGlasses) || 6,
              specialMilestones: data.specialMilestones || [],
              healingNotes: data.healingNotes || '',
              createdAt: data.createdAt || new Date().toISOString()
            });
          });

          // Sort by date ascending
          loaded.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          if (loaded.length === 0) {
            // First time mother: provide default sample to inspect
            setMilestones(DEFAULT_PREVIEW_DATA.map(d => ({ ...d, userId: user.uid })));
          } else {
            setMilestones(loaded);
            try {
              localStorage.setItem(localUserKey, JSON.stringify(loaded));
            } catch {
              // ignore
            }
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Firestore wellnessLogs snapshot warning:', error);
          // Fallback to local storage if network lag
          if (cached) {
            try {
              setMilestones(JSON.parse(cached));
            } catch {
              setMilestones(DEFAULT_PREVIEW_DATA);
            }
          } else {
            setMilestones(DEFAULT_PREVIEW_DATA);
          }
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed setting up firestore listener:', err);
      setMilestones(DEFAULT_PREVIEW_DATA);
      setLoading(false);
    }
  }, [user]);

  // 2. Prepare filtered data for chart
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [milestones]);

  const chartData = useMemo(() => {
    if (sortedMilestones.length === 0) return [];
    const sliceCount = filterDays === 0 ? sortedMilestones.length : filterDays;
    const sliced = sortedMilestones.slice(-sliceCount);

    return sliced.map((m) => {
      // Format friendly day label
      const d = new Date(m.date);
      const dayLabel = isNaN(d.getTime()) 
        ? m.date 
        : d.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', { month: 'short', day: 'numeric' });

      return {
        date: m.date,
        dayLabel,
        sleepHours: m.sleepHours,
        lactationSessions: m.lactationSessions,
        infantMoodScore: m.infantMoodScore,
        maternalVitality: m.maternalVitality,
        waterGlasses: m.waterGlasses,
        sleepQuality: m.sleepQuality,
        lactationComfort: m.lactationComfort,
        infantMood: m.infantMood,
        healingNotes: m.healingNotes
      };
    });
  }, [sortedMilestones, filterDays, language]);

  // 3. Computed aggregates for quick stats
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { avgSleep: 0, avgLactation: 0, avgMood: 0, avgWater: 0, totalLogged: 0 };
    }
    const count = chartData.length;
    const totalSleep = chartData.reduce((acc, curr) => acc + curr.sleepHours, 0);
    const totalLactation = chartData.reduce((acc, curr) => acc + curr.lactationSessions, 0);
    const totalMood = chartData.reduce((acc, curr) => acc + curr.infantMoodScore, 0);
    const totalWater = chartData.reduce((acc, curr) => acc + curr.waterGlasses, 0);

    return {
      avgSleep: (totalSleep / count).toFixed(1),
      avgLactation: (totalLactation / count).toFixed(1),
      avgMood: (totalMood / count).toFixed(1),
      avgWater: Math.round(totalWater / count),
      totalLogged: count
    };
  }, [chartData]);

  // Handle infant mood selection with automatic numeric score
  const handleMoodSelect = (mood: InfantMoodType, score: number) => {
    setFormInfantMood(mood);
    setFormInfantMoodScore(score);
  };

  // Toggle recovery badge check
  const toggleMilestoneBadge = (badge: string) => {
    setFormSelectedMilestones((prev) => 
      prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
    );
  };

  // Handle Form Submission
  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveStatus('saving');

    const logId = user 
      ? `log_${user.uid.slice(0, 8)}_${formDate}` 
      : `guest_${formDate}`;

    const newMilestone: WellnessMilestone = {
      id: logId,
      userId: user ? user.uid : 'guest',
      date: formDate,
      sleepHours: Number(formSleepHours),
      sleepQuality: formSleepQuality,
      lactationSessions: Number(formLactationSessions),
      lactationComfort: formLactationComfort,
      infantMood: formInfantMood,
      infantMoodScore: formInfantMoodScore,
      maternalVitality: formMaternalVitality,
      waterGlasses: Number(formWaterGlasses),
      specialMilestones: formSelectedMilestones,
      healingNotes: formNotes.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      if (user) {
        // Save to Firestore
        await setDoc(doc(db, 'wellnessLogs', logId), newMilestone);
      }

      // Update state immediately for instant feedback
      setMilestones((prev) => {
        const existingIndex = prev.findIndex(m => m.date === formDate);
        let updated: WellnessMilestone[];
        if (existingIndex >= 0) {
          updated = [...prev];
          updated[existingIndex] = newMilestone;
        } else {
          updated = [...prev, newMilestone];
        }
        updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Cache locally
        const storageKey = user ? `maatrisparsh_wellness_${user.uid}` : 'maatrisparsh_guest_wellness';
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsModalOpen(false);
      }, 900);
    } catch (err: any) {
      console.error('Failed saving wellness milestone:', err);
      // Fallback local save even on network issues
      setMilestones((prev) => {
        const existingIndex = prev.findIndex(m => m.date === formDate);
        const updated = existingIndex >= 0 
          ? prev.map((m, i) => i === existingIndex ? newMilestone : m) 
          : [...prev, newMilestone];
        updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return updated;
      });
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsModalOpen(false);
      }, 900);
    }
  };

  const handleDeleteMilestone = async (id: string, milestoneDate: string) => {
    if (!window.confirm(language === 'en' ? 'Remove this daily recovery entry?' : 'क्या आप इस प्रविष्टि को हटाना चाहते हैं?')) {
      return;
    }

    try {
      if (user && !id.startsWith('demo-')) {
        await deleteDoc(doc(db, 'wellnessLogs', id));
      }
      setMilestones(prev => prev.filter(m => m.id !== id && m.date !== milestoneDate));
    } catch (err) {
      console.error('Failed deleting log:', err);
      setMilestones(prev => prev.filter(m => m.id !== id && m.date !== milestoneDate));
    }
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const current = payload[0]?.payload;
      return (
        <div className="bg-stone-900/95 text-stone-100 p-3.5 rounded-2xl shadow-xl border border-stone-700/60 text-xs backdrop-blur-md max-w-xs space-y-2">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <span className="font-serif font-bold text-amber-300 text-sm">{current?.dayLabel || label}</span>
            <span className="text-[10px] text-stone-400 font-mono">{current?.date}</span>
          </div>

          <div className="space-y-1.5 text-stone-200">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                <Moon className="h-3 w-3" />
                <span>{language === 'en' ? 'Maternal Sleep' : 'माँ की नींद'}:</span>
              </span>
              <span className="font-bold text-white font-mono">{current?.sleepHours}h ({current?.sleepQuality})</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-amber-400 font-medium">
                <Heart className="h-3 w-3" />
                <span>{language === 'en' ? 'Lactation Sessions' : 'स्तनपान सत्र'}:</span>
              </span>
              <span className="font-bold text-white font-mono">{current?.lactationSessions} ({current?.lactationComfort})</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-rose-400 font-medium">
                <Smile className="h-3 w-3" />
                <span>{language === 'en' ? 'Infant Mood' : 'शिशु का मूड'}:</span>
              </span>
              <span className="font-bold text-white font-mono">{current?.infantMood} ({current?.infantMoodScore}/5)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-sky-400 font-medium">
                <Droplet className="h-3 w-3" />
                <span>{language === 'en' ? 'Hydration' : 'जल/क्वाथ'}:</span>
              </span>
              <span className="font-bold text-white font-mono">{current?.waterGlasses} {language === 'en' ? 'cups' : 'गिलास'}</span>
            </div>
          </div>

          {current?.healingNotes && (
            <div className="pt-1.5 border-t border-stone-800 text-[11px] text-amber-100/80 italic">
              "{current.healingNotes}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 sm:py-14 px-4 sm:px-6 lg:px-8" id="wellness-tracker-view">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* 1. Header Banner & Identity */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 text-stone-100 p-6 sm:p-10 shadow-xl border border-emerald-900/40">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-emerald-700/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 rounded-full bg-amber-400/15 border border-amber-400/30 px-3.5 py-1 text-xs font-serif font-bold text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>{language === 'en' ? 'Sutika Daily Sanctuary' : 'सूतिका दैनिक आरोग्य एवं संवर्धन'}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {language === 'en' ? 'Postpartum Recovery & Infant Wellness Tracker' : 'प्रसवोत्तर मातृ आरोग्य एवं नवजात शिशु रिकवरी ट्रैकर'}
              </h1>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                {language === 'en' 
                  ? 'Monitor maternal sleep restoration, infant latching rhythm, infant mood harmony, and gentle Ayurvedic milestones in one unified sanctuary.'
                  : 'माता की विश्रामपूर्ण नींद, स्तनपान की निरंतरता, शिशु के मूड और पारंपरिक आयुर्वेदिक प्रसवोत्तर रिकवरी का सहज एवं सुरक्षित दैनिक लेखा-जोखा रखें।'}
              </p>

              {user ? (
                <div className="flex items-center space-x-2 text-xs font-mono text-emerald-300 pt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>
                    {language === 'en' ? 'Logged in as' : 'लॉग इन'}: <strong className="text-white font-serif">{userProfile?.motherName || user.email}</strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-xs font-mono text-amber-300 pt-1">
                  <Info className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    {language === 'en' ? 'Viewing Interactive Guest Demo' : 'इंटरैक्टिव डेमो मोड सक्रिय है'}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setFormDate(new Date().toISOString().split('T')[0]);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center space-x-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-900/20 active:scale-95 transition-all cursor-pointer"
                id="btn-log-recovery"
              >
                <Plus className="h-4 w-4 text-stone-950 stroke-[3]" />
                <span>{language === 'en' ? 'Log Daily Milestone' : 'दैनिक स्वास्थ्य दर्ज करें'}</span>
              </button>

              {!user && onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center justify-center space-x-2 rounded-full border border-stone-600 bg-stone-800/80 hover:bg-stone-700/80 text-white font-semibold px-5 py-3.5 text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{language === 'en' ? 'Sign In to Save' : 'खाता खोलें / लॉगिन'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Key Recovery Metrics Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-2xl bg-white border border-stone-200/90 p-4 sm:p-5 shadow-xs flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 shrink-0">
              <Moon className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-mono font-medium text-stone-500 uppercase tracking-wider block">
                {language === 'en' ? 'Avg. Sleep' : 'औसत मातृत्व नींद'}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900">{stats.avgSleep}</span>
                <span className="text-xs text-stone-500 font-mono">{language === 'en' ? 'hrs/day' : 'घंटे/दिन'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-stone-200/90 p-4 sm:p-5 shadow-xs flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 shrink-0">
              <Heart className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-mono font-medium text-stone-500 uppercase tracking-wider block">
                {language === 'en' ? 'Lactation Sessions' : 'दैनिक स्तनपान'}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900">{stats.avgLactation}</span>
                <span className="text-xs text-stone-500 font-mono">{language === 'en' ? 'feeds/day' : 'सत्र/दिन'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-stone-200/90 p-4 sm:p-5 shadow-xs flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-800 shrink-0">
              <Smile className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-mono font-medium text-stone-500 uppercase tracking-wider block">
                {language === 'en' ? 'Infant Mood Score' : 'शिशु का मूड स्कोर'}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900">{stats.avgMood}</span>
                <span className="text-xs text-stone-500 font-mono">/ 5.0</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-stone-200/90 p-4 sm:p-5 shadow-xs flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-800 shrink-0">
              <Droplet className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-mono font-medium text-stone-500 uppercase tracking-wider block">
                {language === 'en' ? 'Hydration & Decoctions' : 'जल एवं हर्बल क्वाथ'}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900">{stats.avgWater}</span>
                <span className="text-xs text-stone-500 font-mono">{language === 'en' ? 'cups' : 'गिलास'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main Interactive Line Chart with 'recharts' */}
        <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6" id="recovery-line-chart-card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-emerald-800" />
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  {language === 'en' ? 'Daily Recovery Progression Trends' : 'दैनिक स्वास्थ्य एवं रिकवरी प्रगति चार्ट'}
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {language === 'en' 
                  ? 'Visualizing sleep hours, lactation session counts, and infant calmness across consecutive days.'
                  : 'विभिन्न दिनों में माता की नींद, स्तनपान की आवृत्ति और शिशु के मूड का रेखाचित्र।'}
              </p>
            </div>

            {/* Filter buttons & metric toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-stone-100 p-1 rounded-full border border-stone-200 text-xs font-medium">
                <button
                  onClick={() => setChartViewMetric('all')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    chartViewMetric === 'all' ? 'bg-white shadow-xs font-bold text-emerald-900' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {language === 'en' ? 'Combined View' : 'संयुक्त दृश्य'}
                </button>
                <button
                  onClick={() => setChartViewMetric('sleep')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    chartViewMetric === 'sleep' ? 'bg-emerald-800 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {language === 'en' ? 'Sleep (Hrs)' : 'नींद'}
                </button>
                <button
                  onClick={() => setChartViewMetric('lactation')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    chartViewMetric === 'lactation' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {language === 'en' ? 'Lactation' : 'स्तनपान'}
                </button>
                <button
                  onClick={() => setChartViewMetric('mood')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    chartViewMetric === 'mood' ? 'bg-rose-600 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {language === 'en' ? 'Infant Mood' : 'शिशु मूड'}
                </button>
              </div>

              {/* Day range selector */}
              <div className="flex items-center bg-stone-100 p-1 rounded-full border border-stone-200 text-xs font-medium">
                <button
                  onClick={() => setFilterDays(7)}
                  className={`px-2.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    filterDays === 7 ? 'bg-white shadow-xs font-bold text-stone-900' : 'text-stone-600'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setFilterDays(14)}
                  className={`px-2.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    filterDays === 14 ? 'bg-white shadow-xs font-bold text-stone-900' : 'text-stone-600'
                  }`}
                >
                  14D
                </button>
                <button
                  onClick={() => setFilterDays(0)}
                  className={`px-2.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    filterDays === 0 ? 'bg-white shadow-xs font-bold text-stone-900' : 'text-stone-600'
                  }`}
                >
                  {language === 'en' ? 'All' : 'सभी'}
                </button>
              </div>
            </div>
          </div>

          {/* Recharts LineChart container */}
          <div className="w-full h-80 sm:h-96" id="recharts-line-chart-viewport">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <Moon className="h-10 w-10 text-stone-400 mb-2" />
                <p className="font-serif font-bold text-stone-700">
                  {language === 'en' ? 'No milestones logged yet' : 'अभी तक कोई रिकॉर्ड दर्ज नहीं हुआ'}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-3 text-xs bg-emerald-850 text-white font-bold px-4 py-2 rounded-full cursor-pointer"
                >
                  {language === 'en' ? 'Log Your First Day' : 'पहला दिन दर्ज करें'}
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ee" vertical={false} />
                  <XAxis 
                    dataKey="dayLabel" 
                    tick={{ fill: '#78716c', fontSize: 11 }} 
                    axisLine={{ stroke: '#e7e5e4' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 'auto']} 
                    tick={{ fill: '#78716c', fontSize: 11 }}
                    axisLine={{ stroke: '#e7e5e4' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: 15, fontSize: 12, fontFamily: 'inherit' }}
                    iconType="circle"
                  />

                  {/* Sleep Duration Line (Emerald) */}
                  {(chartViewMetric === 'all' || chartViewMetric === 'sleep') && (
                    <Line 
                      type="monotone" 
                      dataKey="sleepHours" 
                      name={language === 'en' ? 'Maternal Sleep (Hours)' : 'माँ की नींद (घंटे)'} 
                      stroke="#047857" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#047857', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#047857', stroke: '#ecfdf5', strokeWidth: 3 }}
                    />
                  )}

                  {/* Lactation Sessions Line (Amber / Gold) */}
                  {(chartViewMetric === 'all' || chartViewMetric === 'lactation') && (
                    <Line 
                      type="monotone" 
                      dataKey="lactationSessions" 
                      name={language === 'en' ? 'Lactation Sessions' : 'स्तनपान सत्र'} 
                      stroke="#d97706" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#d97706', stroke: '#fef3c7', strokeWidth: 3 }}
                    />
                  )}

                  {/* Infant Mood Score Line (Rose) */}
                  {(chartViewMetric === 'all' || chartViewMetric === 'mood') && (
                    <Line 
                      type="monotone" 
                      dataKey="infantMoodScore" 
                      name={language === 'en' ? 'Infant Mood (Score 1-5)' : 'शिशु का मूड (१-५)'} 
                      stroke="#e11d48" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#e11d48', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#e11d48', stroke: '#ffe4e6', strokeWidth: 3 }}
                    />
                  )}

                  {/* Vitality Line (Violet / optional in all view) */}
                  {chartViewMetric === 'vitality' && (
                    <Line 
                      type="monotone" 
                      dataKey="maternalVitality" 
                      name={language === 'en' ? 'Maternal Vitality' : 'माता की ऊर्जा'} 
                      stroke="#7c3aed" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#7c3aed', stroke: '#f3e8ff', strokeWidth: 3 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Chart Footnote / Ayurvedic Insight Indicator */}
          <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 flex items-start space-x-3 text-xs text-amber-950">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-serif font-bold text-amber-900 block">
                {language === 'en' ? 'Ayurvedic Sutika Observation' : 'पारंपरिक आयुर्वेदिक सूत्र'}
              </span>
              <p className="leading-relaxed text-amber-900/90 font-sans">
                {Number(stats.avgSleep) < 6 
                  ? (language === 'en'
                    ? 'Sleep is averaging below 6 hours. Consider adding Padabhyanga (warm sesame oil foot massage) and warm nutmeg milk before nighttime rest to calm Vata dosha.'
                    : 'औसत नींद ६ घंटे से कम है। वात दोष शांत करने के लिए रात्रि में पादाभ्यंग (पैरों में तिल तेल मालिश) और जायफल युक्त गुनगुना दूध लें।')
                  : (language === 'en'
                    ? 'Wonderful sleep rhythm! Regular rest accelerates tissue rejuvenation, balances hormones, and enhances breastmilk letdown reflex.'
                    : 'उत्तम नींद चक्र! नियमित विश्राम से गर्भाशय और शारीरिक ऊतकों का कायाकल्प तीव्र होता है एवं दुग्ध स्राव सुगम बनता है।')}
              </p>
            </div>
          </div>
        </div>

        {/* 4. History Logs & Daily Timeline */}
        <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                {language === 'en' ? 'Daily Milestone Log History' : 'दैनिक प्रविष्टियों का इतिहास'}
              </h3>
              <p className="text-xs text-stone-500">
                {language === 'en' ? 'Chronological breakdown of recorded recovery days.' : 'रिकॉर्ड किए गए दिनों का क्रमवार विवरण।'}
              </p>
            </div>

            <button
              onClick={() => {
                setFormDate(new Date().toISOString().split('T')[0]);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-850 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-full transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>{language === 'en' ? 'Add New' : 'नया जोड़ें'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...sortedMilestones].reverse().map((item) => (
              <div 
                key={item.id} 
                className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 space-y-3 hover:border-emerald-300 hover:bg-white transition-all shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-emerald-800" />
                    <span className="font-serif text-sm font-bold text-stone-900">
                      {new Date(item.date).toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteMilestone(item.id, item.date)}
                    className="text-stone-400 hover:text-rose-600 transition p-1 cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white rounded-xl p-2 border border-stone-200/70">
                    <span className="text-[10px] text-stone-500 block">{language === 'en' ? 'Sleep' : 'नींद'}</span>
                    <span className="font-bold text-emerald-800 font-mono text-sm">{item.sleepHours}h</span>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-stone-200/70">
                    <span className="text-[10px] text-stone-500 block">{language === 'en' ? 'Lactation' : 'स्तनपान'}</span>
                    <span className="font-bold text-amber-800 font-mono text-sm">{item.lactationSessions}</span>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-stone-200/70">
                    <span className="text-[10px] text-stone-500 block">{language === 'en' ? 'Infant' : 'शिशु'}</span>
                    <span className="font-bold text-rose-800 font-mono text-sm">{item.infantMoodScore}/5</span>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-stone-600">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">{language === 'en' ? 'Infant Mood' : 'शिशु का व्यवहार'}:</span>
                    <span className="font-medium text-stone-800">{item.infantMood}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">{language === 'en' ? 'Nursing Comfort' : 'स्तनपान सहजता'}:</span>
                    <span className="font-medium text-stone-800">{item.lactationComfort}</span>
                  </div>
                </div>

                {item.specialMilestones && item.specialMilestones.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.specialMilestones.slice(0, 2).map((badge, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center space-x-1 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-[10px] font-medium px-2 py-0.5"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-emerald-700" />
                        <span>{badge}</span>
                      </span>
                    ))}
                    {item.specialMilestones.length > 2 && (
                      <span className="text-[10px] text-stone-400 font-mono self-center">
                        +{item.specialMilestones.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {item.healingNotes && (
                  <p className="text-[11px] text-stone-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/60 line-clamp-2">
                    "{item.healingNotes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Postpartum Care Booking Promotion Card */}
        {onOpenBooking && (
          <div className="rounded-3xl bg-gradient-to-r from-emerald-900 to-stone-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-amber-400 text-xs font-serif font-bold uppercase tracking-wider">
                {language === 'en' ? 'Need Hands-on Professional Healing?' : 'क्या व्यक्तिगत प्रसवोत्तर अभ्यंग सत्र चाहिए?'}
              </span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold">
                {language === 'en' ? 'Schedule a Traditional Sutika Snana or Latching Session' : 'पारंपरिक सूतिका स्नेहन मालिश या स्तनपान सत्र बुक करें'}
              </h4>
              <p className="text-xs text-stone-300 max-w-xl">
                {language === 'en'
                  ? 'Our certified midwives and pediatric liaisons visit your bedroom in Raipur, Bhilai, and Durg with sterile herbal oils and ancient comforting touch.'
                  : 'हमारे प्रशिक्षित विशेषज्ञ रायपुर, भिलाई और दुर्ग में आपके घर आकर सुरक्षित आयुर्वेदिक सामग्री के साथ संपूर्ण सेवा प्रदान करते हैं।'}
              </p>
            </div>
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center space-x-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider shadow-md shrink-0 cursor-pointer"
            >
              <span>{language === 'en' ? 'Book Care Session' : 'सेवा सत्र बुक करें'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>

      {/* 6. Daily Milestone Entry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-emerald-950 to-stone-900 px-6 py-5 text-white">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-stone-950 font-bold">
                    <Plus className="h-5 w-5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold">
                      {language === 'en' ? 'Log Daily Postnatal Milestone' : 'दैनिक प्रसवोत्तर स्वास्थ्य दर्ज करें'}
                    </h3>
                    <p className="text-xs text-stone-300">
                      {language === 'en' ? 'Record sleep, lactation ease, infant mood, and rituals.' : 'नींद, स्तनपान, शिशु का मूड और दैनिक उपचार सहेजें।'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full bg-stone-800/80 hover:bg-stone-700 p-2 text-stone-300 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveMilestone} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    {language === 'en' ? 'Record Date' : 'तारीख चुनें'}
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm font-medium text-stone-800 focus:border-emerald-700 focus:bg-white focus:outline-none transition"
                  />
                </div>

                {/* Section: Maternal Sleep */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-950">
                      <Moon className="h-4 w-4 text-emerald-800" />
                      <span>{language === 'en' ? 'Maternal Sleep Duration' : 'माँ की कुल नींद'}</span>
                    </span>
                    <span className="font-serif font-bold text-emerald-900 text-base">{formSleepHours} {language === 'en' ? 'Hours' : 'घंटे'}</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="14"
                    step="0.5"
                    value={formSleepHours}
                    onChange={(e) => setFormSleepHours(parseFloat(e.target.value))}
                    className="w-full accent-emerald-800 cursor-pointer"
                  />

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                      {language === 'en' ? 'Sleep Restfulness Quality:' : 'नींद की गुणवत्ता:'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Restful', 'Fair', 'Fragmented', 'Exhausted'] as SleepQualityType[]).map((quality) => (
                        <button
                          key={quality}
                          type="button"
                          onClick={() => setFormSleepQuality(quality)}
                          className={`rounded-xl border py-2 px-2 text-xs font-medium transition cursor-pointer text-center ${
                            formSleepQuality === quality
                              ? 'bg-emerald-850 text-white border-emerald-850 font-bold shadow-xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {quality === 'Restful' && '✨ '}
                          {quality === 'Fair' && '🌤️ '}
                          {quality === 'Fragmented' && '🌙 '}
                          {quality === 'Exhausted' && '🌧️ '}
                          {quality}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section: Lactation Sessions */}
                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-950">
                      <Heart className="h-4 w-4 text-amber-600" />
                      <span>{language === 'en' ? 'Lactation / Nursing Sessions' : 'स्तनपान / फीडिंग सत्र'}</span>
                    </span>
                    <span className="font-serif font-bold text-amber-900 text-base">{formLactationSessions} {language === 'en' ? 'Times' : 'बार'}</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="1"
                    value={formLactationSessions}
                    onChange={(e) => setFormLactationSessions(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                      {language === 'en' ? 'Latching & Breast Comfort:' : 'स्तनपान की सहजता:'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Pain-Free & Smooth', 'Comfortable', 'Mild Engorgement', 'Tender & Sore'] as LactationComfortType[]).map((comfort) => (
                        <button
                          key={comfort}
                          type="button"
                          onClick={() => setFormLactationComfort(comfort)}
                          className={`rounded-xl border py-2 px-2 text-xs font-medium transition cursor-pointer text-center ${
                            formLactationComfort === comfort
                              ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {comfort}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section: Infant Mood & Temperament */}
                <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-950">
                      <Baby className="h-4 w-4 text-rose-600" />
                      <span>{language === 'en' ? 'Infant Mood & Digestion' : 'नवजात शिशु का मूड एवं आराम'}</span>
                    </span>
                    <span className="text-xs font-bold text-rose-800 font-mono">
                      {formInfantMood} ({formInfantMoodScore}/5)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoodSelect('Happy & Content', 5)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition cursor-pointer ${
                        formInfantMood === 'Happy & Content' ? 'bg-rose-600 text-white border-rose-600 font-bold' : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className="text-base">😊</span>
                      <span className="truncate">{language === 'en' ? 'Happy & Content' : 'प्रसन्न एवं शांत'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoodSelect('Playful & Alert', 4)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition cursor-pointer ${
                        formInfantMood === 'Playful & Alert' ? 'bg-rose-600 text-white border-rose-600 font-bold' : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className="text-base">✨</span>
                      <span className="truncate">{language === 'en' ? 'Playful & Alert' : 'सक्रिय व खुश'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoodSelect('Sleepy & Peaceful', 3.5)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition cursor-pointer ${
                        formInfantMood === 'Sleepy & Peaceful' ? 'bg-rose-600 text-white border-rose-600 font-bold' : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className="text-base">😴</span>
                      <span className="truncate">{language === 'en' ? 'Sleepy & Calm' : 'गहरी नींद'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoodSelect('Fussy & Gassy', 2)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition cursor-pointer ${
                        formInfantMood === 'Fussy & Gassy' ? 'bg-rose-600 text-white border-rose-600 font-bold' : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className="text-base">🥺</span>
                      <span className="truncate">{language === 'en' ? 'Gassy / Colicky' : 'पेट में गैस/चिड़चिड़ा'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoodSelect('Colicky & Crying', 1)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition cursor-pointer sm:col-span-2 ${
                        formInfantMood === 'Colicky & Crying' ? 'bg-rose-600 text-white border-rose-600 font-bold' : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className="text-base">😭</span>
                      <span className="truncate">{language === 'en' ? 'Crying & Inconsolable' : 'अत्यधिक रोना / कोलिक'}</span>
                    </button>
                  </div>
                </div>

                {/* Section: Hydration & Kashayam */}
                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-950">
                      <Droplet className="h-4 w-4 text-sky-600" />
                      <span>{language === 'en' ? 'Daily Hydration & Herbal Decoction' : 'जल एवं सौंफ-अजवाइन क्वाथ'}</span>
                    </span>
                    <span className="font-serif font-bold text-sky-900 text-base">{formWaterGlasses} {language === 'en' ? 'Glasses' : 'गिलास'}</span>
                  </div>

                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={formWaterGlasses}
                    onChange={(e) => setFormWaterGlasses(parseInt(e.target.value, 10))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                {/* Section: Special Milestones Achieved */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                    {language === 'en' ? 'Postpartum Recovery Rituals Completed Today:' : 'आज पूर्ण किए गए उपचार व क्रियाएं:'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RECOVERY_BADGES.map((badge) => {
                      const isSelected = formSelectedMilestones.includes(badge);
                      return (
                        <button
                          key={badge}
                          type="button"
                          onClick={() => toggleMilestoneBadge(badge)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                            isSelected 
                              ? 'bg-emerald-850 text-white border border-emerald-850 font-semibold' 
                              : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          <CheckCircle2 className={`h-3 w-3 ${isSelected ? 'text-amber-300' : 'text-stone-400'}`} />
                          <span>{badge}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Mother's Personal Reflection & Daily Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    {language === 'en' ? 'Healing Reflections & Notes' : 'दैनिक अनुभव एवं विशेष नोट्स'}
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Baby burped well after feed; feeling calmer today...' : 'उदा. आज शिशु ने सहजता से स्तनपान किया, मुझे शरीर में हल्कापन महसूस हुआ...'}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 p-3 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:border-emerald-700 focus:bg-white focus:outline-none transition"
                  />
                </div>

                {/* Modal Footer / Save Action */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                  >
                    {language === 'en' ? 'Cancel' : 'रद्द करें'}
                  </button>

                  <button
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className="px-6 py-2.5 rounded-full bg-emerald-850 hover:bg-emerald-950 text-white text-xs font-bold uppercase tracking-wider shadow-md transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {saveStatus === 'saving' ? (
                      <span>{language === 'en' ? 'Saving...' : 'सहेज रहे हैं...'}</span>
                    ) : saveStatus === 'saved' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-amber-300" />
                        <span>{language === 'en' ? 'Saved Successfully!' : 'सफलतापूर्वक सहेजा गया!'}</span>
                      </>
                    ) : (
                      <span>{language === 'en' ? 'Save Today\'s Milestone' : 'दैनिक रिकॉर्ड सहेजें'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
