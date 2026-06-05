import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Leaf, Heart, Star, Sparkles, Smile, Baby, Calendar, Play, Pause, Volume2, VolumeX, Upload, RotateCcw, Trash2, Check, Tag, ChevronDown, ChevronUp, Info, Percent, Shield } from 'lucide-react';
import { Service } from '../types';
import { SERVICES as STATIC_SERVICES } from '../data';
import { useFirebase } from './FirebaseProvider';
import { useLanguage } from './LanguageProvider';

// Helper functions for storing and retrieving the video to/from IndexedDB
const openVideoDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MaatriSparshVideoDB', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveVideoToDB = async (blob: Blob): Promise<void> => {
  const db = await openVideoDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('media', 'readwrite');
    const store = transaction.objectStore('media');
    const request = store.put(blob, 'heroVideo');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getVideoFromDB = async (): Promise<Blob | null> => {
  try {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('media', 'readonly');
      const store = transaction.objectStore('media');
      const request = store.get('heroVideo');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB error:', err);
    return null;
  }
};

const getDriveId = (url: string): string => {
  if (!url) return '';
  const matchD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return (matchD && matchD[1]) || (matchId && matchId[1]) || '';
};

const resolveVideoSrc = (url: string): string => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const id = getDriveId(url);
    if (id) {
      return `https://drive.google.com/uc?export=download&id=${id}`;
    }
  }
  return url;
};

const isInstagramUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('instagram.com/reel/') || url.includes('instagram.com/p/');
};

const getInstagramEmbedUrl = (url: string): string => {
  if (!url) return '';
  const match = url.match(/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://www.instagram.com/reel/${match[1]}/embed?autoplay=1&muted=1`;
  }
  return url;
};

interface HomeViewProps {
  onNavigateToTab: (tab: string) => void;
  onOpenBookingWithService: (serviceId: string) => void;
}

export default function HomeView({ onNavigateToTab, onOpenBookingWithService }: HomeViewProps) {
  const { services, reviews, isAdmin } = useFirebase();
  const { t, language } = useLanguage();

  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // Initialize to false, will sync onPlay
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [deliveryType, setDeliveryType] = useState<'normal' | 'lscs'>('normal');
  const [selectedMMServiceId, setSelectedMMServiceId] = useState<string>('normal-sukoon-7');
  const [activeCouponCode, setActiveCouponCode] = useState<string>('');
  const [activeMMTab, setActiveMMTab] = useState<'benefits' | 'pricing'>('benefits');

  useEffect(() => {
    setSelectedMMServiceId(deliveryType === 'normal' ? 'normal-sukoon-7' : 'lscs-sukoon-7');
  }, [deliveryType]);

  const defaultVideo = 'https://www.instagram.com/reel/DYzl-FIsD4e/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==';

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const loadVideo = async () => {
      const storedBlob = await getVideoFromDB();
      if (!active) return;
      if (storedBlob) {
        objectUrl = URL.createObjectURL(storedBlob);
        setVideoUrl(objectUrl);
      } else {
        setVideoUrl(defaultVideo);
      }
    };

    loadVideo();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

  // Sync fallback helper when url changes
  useEffect(() => {
    if (videoUrl && isInstagramUrl(videoUrl)) {
      setUseIframeFallback(true);
    } else if (videoUrl && videoUrl.includes('drive.google.com')) {
      // Start with normal stream, but error callback switches to custom iFrame if rate limited
      setUseIframeFallback(false);
    } else {
      setUseIframeFallback(false);
    }
  }, [videoUrl]);

  // Try to play video when videoUrl becomes active
  useEffect(() => {
    const video = videoRef.current;
    if (!useIframeFallback && video && videoUrl) {
      // Force muted properties at the DOM level for browser compliance
      video.muted = true;
      video.defaultMuted = true;
      setIsMuted(true);

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasEnded(false);
          })
          .catch(e => {
            console.log('Initial load autoplay prevented or interrupted:', e);
            setIsPlaying(false);
          });
      }
    }
  }, [videoUrl, useIframeFallback]);

  // Fallback autoplay handler for silent gesture triggers (scroll, click, touch) to bypass strict browser media policies
  useEffect(() => {
    const handleGesture = () => {
      const video = videoRef.current;
      if (video && video.paused && !hasEnded) {
        video.muted = true;
        video.play()
          .then(() => {
            setIsPlaying(true);
            setHasEnded(false);
          })
          .catch(err => {
            console.log('Gesture autoplay fallback failed:', err);
          });
      }
    };

    // Listen on multiple basic interaction points
    window.addEventListener('click', handleGesture, { once: true, capture: true });
    window.addEventListener('touchstart', handleGesture, { once: true, capture: true });
    window.addEventListener('scroll', handleGesture, { once: true, capture: true });

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('scroll', handleGesture);
    };
  }, [hasEnded]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (hasEnded) {
        videoRef.current.currentTime = 0;
        setHasEnded(false);
      }
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.log('Manual play failed:', err);
          setIsPlaying(false);
        });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert(language === 'en' ? 'Please upload a valid MP4/WebM video file.' : 'कृपया एक सही वीडियो फ़ाइल (.mp4) अपलोड करें।');
      return;
    }

    try {
      await saveVideoToDB(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setHasEnded(false);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.load();
        videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
      }
    } catch (err) {
      console.error('Failed to save to local database:', err);
    }
  };

  const clearCustomVideo = async () => {
    try {
      const db = await openVideoDB();
      const transaction = db.transaction('media', 'readwrite');
      const store = transaction.objectStore('media');
      await store.delete('heroVideo');
      setVideoUrl(defaultVideo);
      setHasEnded(false);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = defaultVideo;
        videoRef.current.load();
        videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
      }
    } catch (err) {
      console.error('Failed to delete custom video:', err);
    }
  };

  const activeServices = services && services.length > 0 ? services.filter(s => s.activeStatus) : STATIC_SERVICES;

  // Matchmaker state
  const [timeline, setTimeline] = useState<'early' | 'medium' | 'late' | 'expecting'>('early');
  const [need, setNeed] = useState<'pain' | 'colic' | 'lactation' | 'blues'>('pain');

  const getProfiledRecommendation = (): { recommendedService: Service; reason: string; reasonHindi: string } => {
    if (need === 'lactation') {
      const srv = activeServices.find(s => s.id === 'normal-sukoon-7') || activeServices[0];
      return {
        recommendedService: srv,
        reason: "Our 7-Day Sukoon Saptah package includes highly skilled lactation hold posture training and baby feeding alignment which prevents breast soreness and naturally supports healthy milk flow.",
        reasonHindi: "हमारा 7 दिवसीय सुकून सप्ताह पैकेज प्रसवोत्तर स्तनपान और विशेष लैक्टेशन देखभाल से सुसज्जित है। विशेषज्ञ थेरेपिस्ट सही मुद्रा व बेबी डक्ट हेल्थ एलाइनमेंट सिखाते हैं जो माताओं को आराम देता है।"
      };
    }
    if (need === 'blues') {
      const srv = activeServices.find(s => s.id === 'normal-puran-14') || activeServices[1] || activeServices[0];
      return {
        recommendedService: srv,
        reason: "Hormonal shifts require maximum physical comfort and sensory soothing. The 14-Day Puran Aarohan treatment provides comforting traditional warm oil flow therapies to deeply anchor and ground your nervous system.",
        reasonHindi: "हार्मोनल बदलाव व थकावट के दौरान गहन आराम की आवश्यकता होती है। हमारा 14-दिवसीय पूर्ण आरोग्यता / सूतिका आरोग्यता पैकेज प्राचीन केरल पद्धतियों के विशेष तेल प्रवाह व सूतिका स्पा द्वारा मानसिक शांति व ऊर्जा प्रदान करता है।"
      };
    }
    // general pain / colic -> nutrition, alignment
    const srv = activeServices.find(s => s.id === 'lscs-navya-4') || activeServices[2] || activeServices[0];
    return {
      recommendedService: srv,
      reason: "Postpartum abdominal binding, correct sleeping positions, and pediatric digestive colic wraps under Navya LSCS Care helps mothers manage surgical incisions while securing deep comfort from joint soreness and lower spine stress.",
      reasonHindi: "सिजेरियन डिलीवरी के बाद सही संचलन और शिशु पाचन मरोड़ में आराम के लिए ‘नव्या रिकवरी’। बेली बाइंडिंग और एर्गोनोमिक रीढ़ संरेखण मांसपेशियों की सूजन और पीठ दर्द में त्वरित राहत देते हैं।"
    };
  };

  const { recommendedService, reason, reasonHindi } = getProfiledRecommendation();

  // Pick top 3 postnatal packages for homepage showcase
  const homepageFeatured = activeServices.slice(0, 3);

  return (
    <div className="relative overflow-hidden" id="home-view">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-10 pb-20 sm:px-6 lg:px-8 lg:pt-16 bg-gradient-to-b from-stone-150/40 via-stone-100/30 to-stone-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 border border-rose-100 shadow-xs"
              >
                <Baby className="h-3.5 w-3.5 text-rose-500 animate-pulse shrink-0" />
                <span>{t.welcome}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="font-serif text-3.5xl font-bold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl leading-tight"
              >
                {t.heroTitle}
                <span className="text-emerald-800 font-serif italic underline decoration-gold-650 underline-offset-4">
                  {t.heroTitleAccent}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl"
              >
                {t.heroDesc}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 pt-2"
              >
                <button
                  onClick={() => onNavigateToTab('services')}
                  className="flex items-center justify-center space-x-2 rounded-full bg-emerald-800 px-6 py-3.5 text-xs sm:text-sm font-bold text-stone-50 shadow-md hover:bg-emerald-900 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <span>{t.exploreBtn}</span>
                  <ArrowRight className="h-4 w-4 text-rose-200 shrink-0" />
                </button>
                <button
                  onClick={() => onOpenBookingWithService('normal-sukoon-7')}
                  className="flex items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-stone-800 hover:bg-stone-50 transition-all active:scale-95 cursor-pointer"
                >
                  {t.latchingBtn}
                </button>
              </motion.div>

              {/* Verified Care Metrics */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-6 grid grid-cols-3 gap-4 border-t border-stone-250/60 text-stone-700"
              >
                <div>
                  <span className="block font-serif text-2xl sm:text-3xl font-bold text-emerald-800">{t.metricsMothers}</span>
                  <span className="text-xs text-stone-500 leading-snug">{t.metricsMothersSub}</span>
                </div>
                <div>
                  <span className="block font-serif text-2xl sm:text-3xl font-bold text-emerald-800">{t.metricsSafe}</span>
                  <span className="text-xs text-stone-500 leading-snug">{t.metricsSafeSub}</span>
                </div>
                <div>
                  <span className="block font-serif text-2xl sm:text-3xl font-bold text-emerald-800">{t.metricsSupport}</span>
                  <span className="text-xs text-stone-500 leading-snug">{t.metricsSupportSub}</span>
                </div>
              </motion.div>
            </div>

            {/* Right Graphic Columns */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-5 relative mt-6 lg:mt-0"
              id="hero-image-pane"
            >
              <div className="relative mx-auto max-w-[380px] lg:max-w-none">
                <div className="absolute -inset-3 rounded-2xl border-2 border-rose-200/50 -rotate-2" />
                <div className="absolute inset-0 rounded-2xl bg-emerald-800/5 rotate-1" />

                <div className="relative overflow-hidden rounded-xl shadow-lg border border-stone-200/60 bg-stone-950 group">
                  {videoUrl && (
                    isInstagramUrl(videoUrl) ? (
                      <iframe
                        src={getInstagramEmbedUrl(videoUrl)}
                        className="h-[480px] sm:h-[550px] w-full object-cover border-0"
                        allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
                        allowFullScreen
                        id="hero-instagram-iframe-player"
                      ></iframe>
                    ) : useIframeFallback ? (
                      <iframe
                        src={`https://drive.google.com/file/d/${getDriveId(videoUrl)}/preview?autoplay=1&mute=1`}
                        className="h-[480px] sm:h-[550px] w-full object-cover border-0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        id="hero-gd-iframe-player"
                      ></iframe>
                    ) : (
                      <video
                        ref={videoRef}
                        src={resolveVideoSrc(videoUrl)}
                        className="h-[480px] sm:h-[550px] w-full object-cover transition-opacity duration-300"
                        autoPlay={true}
                        muted={true}
                        playsInline={true}
                        loop={true}
                        preload="auto"
                        onLoadedMetadata={(e) => {
                          const v = e.currentTarget;
                          v.muted = true;
                          v.play().catch(err => {
                            console.log("onLoadedMetadata autoplay trigger:", err);
                          });
                        }}
                        onCanPlay={(e) => {
                          const v = e.currentTarget;
                          v.muted = true;
                          v.play().catch(err => {
                            console.log("onCanPlay autoplay trigger:", err);
                          });
                        }}
                        onPlay={() => {
                          setIsPlaying(true);
                          setHasEnded(false);
                        }}
                        onPause={() => {
                          setIsPlaying(false);
                        }}
                        onTimeUpdate={(e) => {
                          const v = e.currentTarget;
                          if (v.duration) {
                            setProgress((v.currentTime / v.duration) * 100);
                          }
                        }}
                        onEnded={() => {
                          setIsPlaying(false);
                          setHasEnded(true);
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                          }
                          setProgress(0);
                        }}
                        onError={() => {
                          if (videoUrl.includes('drive.google.com')) {
                            console.warn("Direct stream load failed, switching to Google Drive embedded iframe fallback.");
                            setUseIframeFallback(true);
                          }
                        }}
                      />
                    )
                  )}

                  {/* Play/Pause Center Indicator */}
                  {!useIframeFallback && (
                    <div 
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/25 transition-all duration-300 cursor-pointer"
                    >
                      {!isPlaying && (
                        <motion.div
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="p-5 rounded-full bg-white/95 text-emerald-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md flex items-center justify-center transform group-hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 select-none"
                        >
                          {hasEnded ? <RotateCcw className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Control Overlays */}
                  {!useIframeFallback && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
                      {/* Audio Toggle */}
                      <button
                        onClick={toggleMute}
                        className="p-2.5 rounded-full bg-black/45 hover:bg-black/60 text-white backdrop-blur-xs transition hover:scale-105 cursor-pointer flex items-center justify-center"
                        title={isMuted ? "Unmute Audio" : "Mute Audio"}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                    </div>
                  )}

                  {/* Admin Direct Video Upload Button */}
                  {isAdmin && (
                    <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="py-1.5 px-3 rounded-lg bg-emerald-800/90 text-white text-xs font-bold font-sans shadow-md flex items-center gap-1.5 hover:bg-emerald-700 backdrop-blur-xs transition active:scale-95 cursor-pointer"
                      >
                        <Upload className="h-3 w-3" />
                        {language === 'en' ? 'Upload Video' : 'वीडियो अपलोड'}
                      </button>
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleVideoUpload}
                        accept="video/*"
                        className="hidden"
                      />
                      {videoUrl !== defaultVideo && (
                        <button
                          onClick={clearCustomVideo}
                          className="py-1 px-2.5 rounded-md bg-rose-800/80 hover:bg-rose-700 text-white text-[10px] font-bold font-sans flex items-center gap-1 shadow-md transition active:scale-95 cursor-pointer"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                          {language === 'en' ? 'Reset' : 'रीसेट करें'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Subtle Video Real-Time Progress Bar */}
                  {!useIframeFallback && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-800/40 z-10 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600/90 transition-all duration-250" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}


                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Core Care Pillars focusing on mother AND baby */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-stone-150">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a16207] font-mono">
              {language === 'en' ? 'Our Care Pillars' : 'हमारे प्रमुख स्तंभ'}
            </span>
            <h2 className="text-2.5xl sm:text-4xl font-bold tracking-tight text-stone-950">
              {language === 'en' ? 'Nurturing Beyond Medicine' : 'चिकित्सा विज्ञान और परंपरा का संगम'}
            </h2>
            <div className="h-0.5 w-16 bg-emerald-800 mx-auto rounded-full" />
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {language === 'en' 
                ? 'Bringing structural pelvic relief, sleep security, and digestion alignment to your home through natural and authentic holistic pathways.'
                : 'प्राकृतिक और प्रामाणिक समग्र प्रणालियों द्वारा आपके घर में ही रीढ़ के दर्द से आराम, शिशु की नींद में सुधार और स्तनपान मार्गदर्शन उपलब्ध कराना।'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3" id="pillars-container">
            {/* Pillar 1 */}
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-stone-200 p-5 sm:p-7 bg-stone-50/50 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-2.5 bg-rose-50 rounded-xl inline-block text-rose-650">
                  <Heart className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold font-serif text-stone-900">
                  {language === 'en' ? 'Maternal Posture & Core Recovery' : 'मातृ शारीरिक संरेखण व रिकवरी'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {language === 'en'
                    ? 'Alleviates spine strain and pelvic structural fatigue immediately after delivery. Private guidance on corrected resting layouts and comfortable abdominal wrapping.'
                    : 'प्रसव के बाद रीढ़ और जोड़ों की अकड़न को दूर करना। आरामदायक सूती कपड़े का बेली बाइंडिंग लपेटने का सुरक्षित प्रशिक्षण व लेटने की मुद्राओं का मार्गदर्शन।'}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-200/60 text-[10px] sm:text-xs font-serif text-emerald-800 font-bold">
                {language === 'en' ? 'Core Postural Guidance' : 'कमर दर्द से सुलभ प्राकृतिक राहत'}
              </div>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-stone-200 p-5 sm:p-7 bg-stone-50/50 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl inline-block text-emerald-800">
                  <Baby className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold font-serif text-stone-900">
                  {language === 'en' ? 'Newborn Calming & Sleep Care' : 'नवजात देखभाल व सुलभ निंद्रा'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {language === 'en'
                    ? 'Safeguarding infant sleep timelines and breathing postures. Guidelines on comfortable room settings, swaddling positions, and safe temperature schedules.'
                    : 'शिशु की सुरक्षा सुनिश्चित करना और अच्छी गहरी नींद। कोमल स्वैडलिंग (कपड़े में लपेटना), कमरे के सही तापमान का निर्धारण व स्लीप ट्रेनिंग।'}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-200/60 text-[10px] sm:text-xs font-serif text-emerald-800 font-bold">
                {language === 'en' ? 'Safe Sleep & Swaddle Routines' : 'सुरक्षित पर्यावरण व स्लीप शेड्यूल'}
              </div>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-stone-200 p-5 sm:p-7 bg-stone-50/50 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-2.5 bg-amber-50 rounded-xl inline-block text-[#a16207]">
                  <Sparkles className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold font-serif text-stone-900">
                  {language === 'en' ? 'Latching & Lactation Sanctuary' : 'स्तनपान मार्गदर्शन (Latching)'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {language === 'en'
                    ? 'Certified maternal guidance addressing optimal baby mouth latch positions, holding placements, and planning balanced nutritious postpartum meals.'
                    : 'स्तनपान को आसान व दर्द रहित बनाना। क्लिनिकल लैचिंग सही करने के तरीके, नई माँ के बेहतर दूध प्रवाह के लिए घरेलू पौष्टिक आहार योजना।'}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-200/60 text-[10px] sm:text-xs font-serif text-emerald-800 font-bold">
                {language === 'en' ? 'Empathetic Nursing Support' : 'स्तनपान संवर्धन व स्तन स्वास्थ्य'}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Matchmaker Widget (Postnatal & Newborn Custom Profile Selector) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50" id="package-matchmaker-planner">
        <div className="mx-auto max-w-5xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a16207] font-mono flex items-center justify-center space-x-1.5">
              <Smile className="h-4.5 w-4.5 text-amber-500 shrink-0" />
              <span>{language === 'en' ? 'Interactive Care Explorer' : 'अन्तरक्रियात्मक मातृत्व केयर प्लानर'}</span>
            </span>
            <h2 className="text-2.5xl sm:text-4xl font-bold tracking-tight text-stone-950 font-serif">
              {language === 'en' ? 'Find & Calculate Your Perfect Package' : 'अपना आदर्श केयर पैकेज चुनें व फीस की गणना करें'}
            </h2>
            <div className="h-0.5 w-16 bg-emerald-800 mx-auto rounded-full" />
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {language === 'en' 
                ? 'Select your delivery parameters, toggle between matched packages, and apply real promotional certificates to see final transparent costs.'
                : 'अपनी प्रसव स्थिति व आवश्यकताओं का चयन करें, विभिन्न पैकेजों में टूल स्विच करें, और वास्तविक छूट प्रमाणपत्र लागू करके पारदर्शी फीस देखें।'}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            
            {/* Selection Inputs Column (Left Side) */}
            <div className="lg:col-span-7 p-5 sm:p-8 space-y-6 flex flex-col justify-between">
              
              <div className="space-y-5">
                {/* 1. Delivery Profile Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-800" />
                    {language === 'en' ? '1. Select Delivery Method' : '१. प्रसव का प्रकार चुनें'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDeliveryType('normal')}
                      className={`text-center p-3.5 rounded-2xl border text-xs font-bold tracking-wide transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        deliveryType === 'normal'
                          ? 'border-emerald-800 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-800/15'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <span className="text-sm">🌸</span>
                      <span>{language === 'en' ? 'Normal Delivery Care' : 'नॉर्मल डिलीवरी केयर'}</span>
                    </button>
                    <button
                      onClick={() => setDeliveryType('lscs')}
                      className={`text-center p-3.5 rounded-2xl border text-xs font-bold tracking-wide transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        deliveryType === 'lscs'
                          ? 'border-emerald-800 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-800/15'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <span className="text-sm">👩‍⚕️</span>
                      <span>{language === 'en' ? 'C-Section / LSCS Care' : 'सी-सेक्शन (सिजेरियन) केयर'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Timeline Step Pickers */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    {language === 'en' ? '2. Postnatal Phase Timeline' : '२. प्रसवोत्तर चरण / वर्तमान अवधि'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'expecting', en: "Pregnancy / Pre-delivery", hi: "गर्भावस्था / प्रसव पूर्व" },
                      { id: 'early', en: "1-4 Weeks Postnatal", hi: "१-४ सप्ताह प्रसवोत्तर" },
                      { id: 'medium', en: "5-12 Weeks Postnatal", hi: "५-१२ सप्ताह प्रसवोत्तर" },
                      { id: 'late', en: "3+ Months Postnatal", hi: "३+ महीने प्रसवोत्तर" },
                    ].map((tItem) => (
                      <button
                        key={tItem.id}
                        onClick={() => setTimeline(tItem.id as any)}
                        className={`text-left px-3 py-2.5 rounded-xl border text-[11px] font-semibold tracking-wide transition-all cursor-pointer ${
                          timeline === tItem.id
                            ? 'border-stone-800 bg-stone-900 text-white font-bold'
                            : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        {language === 'en' ? tItem.en : tItem.hi}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Need categories chips picker */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    {language === 'en' ? '3. Primary Care Need' : '३. मुख्य शारीरिक आवश्यकता / तकलीफ'}
                  </label>
                  <div className="flex flex-wrap gap-2" id="care-needs-chips">
                    {[
                      { id: 'pain', en: 'Body Pain / Spine Ache', hi: 'पीठ दर्द व शारीरिक थकान' },
                      { id: 'colic', en: 'Infant Colic / Wind', hi: 'शिशु का रोना / मरोड़ दर्द' },
                      { id: 'lactation', en: 'Breastfeeding Latch', hi: 'स्तनपान सही कराने का प्रशिक्षण' },
                      { id: 'blues', en: 'Maternal Blues / Stress', hi: 'नींद की कमी व प्रसवोत्तर चिढ़चिढ़ाहट' },
                    ].map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setNeed(n.id as any)}
                        className={`py-2 px-3 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                          need === n.id
                            ? 'bg-[#a16207] border-[#a16207] text-[#fefce8] font-semibold shadow-xs'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        {language === 'en' ? n.en : n.hi}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matched Care Packages Interactive List */}
              <div className="pt-6 border-t border-stone-150 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-widest font-mono">
                    {language === 'en' ? 'Matched Packages (Click to load details)' : 'आपके लिए उपयुक्त पैकेज (विवरण के लिए क्लिक करें)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="mm-filtered-packages">
                  {activeServices
                    .filter(s => deliveryType === 'normal' ? s.id.startsWith('normal') : s.id.startsWith('lscs'))
                    .map((s) => {
                      const isSelected = selectedMMServiceId === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedMMServiceId(s.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                            isSelected 
                              ? 'border-emerald-800 bg-emerald-50/40 ring-1 ring-emerald-800' 
                              : 'border-stone-200 hover:border-stone-300 hover:shadow-xs bg-stone-50/50'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-1 pb-1">
                              <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-900 transition-colors font-serif line-clamp-1">
                                {language === 'en' ? s.name.split(' - ')[0] : s.nameHindi.split(' - ')[0]}
                              </h4>
                              {isSelected && <span className="bg-emerald-800 text-white p-0.5 rounded-full text-[8px] animate-pulse">✓</span>}
                            </div>
                            <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">
                              {language === 'en' ? s.description : s.descriptionHindi}
                            </p>
                          </div>
                          <div className="pt-2.5 mt-2 border-t border-stone-200/50 flex justify-between items-baseline text-[11px] font-mono">
                            <span className="text-stone-400">⏱ {s.duration} mins</span>
                            <span className="font-extrabold text-[#a16207]">₹{s.priceInr.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Dynamic Package Reader & Price Calculations Column (Right Side - Deep Dive) */}
            {(() => {
              const currentMMService = activeServices.find(s => s.id === selectedMMServiceId) || activeServices[0];
              
              // Calculate discount logic:
              const originalPrice = currentMMService.priceInr;
              let discount = 0;
              let promoText = '';

              if (activeCouponCode === 'FESTIVAL20') {
                discount = Math.round(originalPrice * 0.20);
                if (discount > 1000) discount = 1000;
                promoText = language === 'en' ? 'Festival Welcome 20% Voucher Applied!' : 'विशेष त्योहार २०% कूपन लागू हुआ!';
              } else if (activeCouponCode === 'NEWBORN15') {
                discount = Math.round(originalPrice * 0.15);
                if (discount > 500) discount = 500;
                promoText = language === 'en' ? 'New Mother Welcome 15% Token Applied!' : 'नई माँ स्वागत १५% कूपन लागू हुआ!';
              } else if (activeCouponCode === 'SANCTUM500') {
                if (originalPrice >= 2500) {
                  discount = 500;
                  promoText = language === 'en' ? 'Flat ₹500 Discount Voucher Applied!' : 'फ्लैट ₹५०० की सीधी बचत कूपन लागू हुआ!';
                }
              }

              const finalPrice = originalPrice - discount;

              return (
                <div className="lg:col-span-5 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-stone-100 p-5 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-850">
                  <div className="space-y-5">
                    
                    {/* Header badge with image backdrop */}
                    <div className="relative rounded-2xl overflow-hidden h-36 bg-stone-900 border border-stone-800">
                      <img 
                        src={currentMMService.image} 
                        alt={currentMMService.name} 
                        className="w-full h-full object-cover opacity-60"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                      
                      <div className="absolute top-3 left-3 bg-rose-950/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-rose-900 text-[9px] font-bold uppercase tracking-widest text-rose-250">
                        {language === 'en' ? currentMMService.category.replace('_', ' ') : 'प्रसवोत्तर सुरक्षा'}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-amber-400 block pb-0.5">
                          {language === 'en' ? 'Selected Package' : 'चयनित पैकेज'}
                        </span>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-white line-clamp-1 leading-tight">
                          {language === 'en' ? currentMMService.name : currentMMService.nameHindi}
                        </h3>
                      </div>
                    </div>

                    {/* Interactive Tab Switcher */}
                    <div className="grid grid-cols-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
                      <button
                        onClick={() => setActiveMMTab('benefits')}
                        className={`py-2 text-[11px] font-bold uppercase tracking-wider text-center rounded-lg transition-all cursor-pointer ${
                          activeMMTab === 'benefits'
                            ? 'bg-emerald-800/80 text-white shadow-xs font-black'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {language === 'en' ? '📋 Included Therapies' : '📋 शामिल सत्र थेरेपी'}
                      </button>
                      <button
                        onClick={() => setActiveMMTab('pricing')}
                        className={`py-2 text-[11px] font-bold uppercase tracking-wider text-center rounded-lg transition-all cursor-pointer ${
                          activeMMTab === 'pricing'
                            ? 'bg-emerald-800/80 text-white shadow-xs font-black'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {language === 'en' ? '💰 Price Details' : '💰 फीस का पारदर्शी विवरण'}
                      </button>
                    </div>

                    {/* Tab 1 Content: Benefits List with animated rows */}
                    {activeMMTab === 'benefits' && (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {(language === 'en' ? currentMMService.benefits : currentMMService.benefitsHindi || currentMMService.benefits).map((benefit, bIdx) => (
                          <div key={bIdx} className="flex gap-2.5 items-start text-xs text-stone-300 leading-relaxed bg-stone-900/35 p-2 rounded-lg border border-stone-850">
                            <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 2 Content: Cost Breakdown Grid with Interactive Coupon Result */}
                    {activeMMTab === 'pricing' && (
                      <div className="space-y-2.5 text-xs text-stone-300 bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                        <div className="flex justify-between items-center py-1 border-b border-stone-850">
                          <span className="text-stone-400">{language === 'en' ? 'Base Package Tuition:' : 'मूल स्वास्थ्य सेवा शुल्क:'}</span>
                          <span className="font-mono font-medium">₹{originalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-stone-850">
                          <span className="text-stone-400 flex items-center gap-1">
                            <span>🌿</span>
                            <span>{language === 'en' ? 'Organic Herbal Oils:' : 'ऑर्गेनिक हर्बल तेल:'}</span>
                          </span>
                          <span className="text-emerald-400 font-bold uppercase text-[9.5px] font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900">{language === 'en' ? 'Included / Free' : 'शामिल / मुफ़्त'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-stone-850">
                          <span className="text-stone-400 flex items-center gap-1">
                            <span>🎗</span>
                            <span>{language === 'en' ? 'Cotton Belly Binding Wrap:' : 'सूती बेली बाइंडिंग पट्टा:'}</span>
                          </span>
                          <span className="text-emerald-400 font-bold uppercase text-[9.5px] font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900">{language === 'en' ? 'Included / Free' : 'शामिल / मुफ़्त'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-stone-850">
                          <span className="text-stone-400">{language === 'en' ? 'GST Tax Rate:' : 'जीएसटी (कर की दर):'}</span>
                          <span className="text-amber-400 shrink-0 font-bold text-[9.5px] font-mono bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900">{language === 'en' ? '₹0 (Tax Exempt Recovery)' : '₹0 (स्वास्थ्य सेवा कर मुक्त)'}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between items-center py-1 border-b border-stone-850 text-emerald-400 font-bold">
                            <span>{language === 'en' ? 'Certificate Reduction:' : 'छूट कूपन कटौती:'}</span>
                            <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 text-white font-serif font-bold text-sm">
                          <span>{language === 'en' ? 'Net Calculated Cost:' : 'कुल पारदर्शी शुल्क:'}</span>
                          <span className="text-rose-250 font-mono text-base">₹{finalPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}

                    {/* Interactive Special Offers Apply Field */}
                    <div className="space-y-2 pt-2 border-t border-stone-800">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a16207] font-mono flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        {language === 'en' ? 'Active Promotional Vouchers (Click to Apply)' : 'सक्रिय मातृत्व बचत वाउचर्स (लागू करने हेतु क्लिक करें)'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { code: 'FESTIVAL20', pct: '20%', labelEn: '20% Off', labelHi: '२०% छूट' },
                          { code: 'NEWBORN15', pct: '15%', labelEn: '15% Off', labelHi: '१५% छूट' },
                          { code: 'SANCTUM500', pct: '₹500', labelEn: '₹500 Off', labelHi: '₹५०० बचाएं' }
                        ].map((cp) => {
                          const isApplied = activeCouponCode === cp.code;
                          return (
                            <button
                              key={cp.code}
                              onClick={() => setActiveCouponCode(isApplied ? '' : cp.code)}
                              className={`py-1.5 px-3 rounded-xl border text-[10.5px] font-mono font-bold tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                                isApplied
                                  ? 'bg-emerald-800 border-white text-white shadow-xs scale-103'
                                  : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                              }`}
                            >
                              <Percent className="h-3 w-3 text-amber-500" />
                              <span>{cp.code}</span>
                              <span className="text-[9px] bg-stone-950/40 text-stone-300 px-1.5 py-0.5 rounded border border-stone-800">{language === 'en' ? cp.labelEn : cp.labelHi}</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Interactive alert summarizing savings */}
                      {discount > 0 && promoText && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/45 border border-emerald-900 text-[11px] text-emerald-300 flex items-center gap-1.5 animate-fade-in">
                          <span>✨</span>
                          <span>{promoText} (<strong>{language === 'en' ? 'Saved' : 'बचे'}: ₹{discount}</strong>)</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="pt-5 border-t border-stone-800 space-y-3 mt-4">
                    <div className="flex justify-between items-baseline font-sans text-xs">
                      <span className="text-[#a16207] font-bold flex items-center gap-1.5">
                        <Info className="h-4 w-4 shrink-0" />
                        {language === 'en' ? 'Total Payable (No Hidden Costs):' : 'अंतिम देय शुल्क (कोई छिपी फीस नहीं):'}
                      </span>
                      <span className="font-serif font-black text-2xl text-white">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => onNavigateToTab('services')}
                        className="rounded-xl border border-stone-700 bg-stone-900/60 hover:bg-stone-800 text-stone-200 py-3 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center"
                      >
                        {language === 'en' ? 'Explore Details' : 'विस्तार से जानें'}
                      </button>
                      <button
                        onClick={() => {
                          const wizardBtn = document.getElementById('wizard-booking-entry-trigger');
                          if (wizardBtn) {
                            onOpenBookingWithService(currentMMService.id);
                          } else {
                            onOpenBookingWithService(currentMMService.id);
                          }
                        }}
                        className="rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer text-center"
                      >
                        {language === 'en' ? 'Book Package' : 'पैकेज बुक करें'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </section>

      {/* Featured Service Packages on Homepage */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-150">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#a16207] font-mono">
                {language === 'en' ? 'Specialized Traditional Care' : 'विशेष पारंपरिक उपचार योजना'}
              </span>
              <h2 className="text-2.5xl sm:text-4xl font-bold tracking-tight text-stone-900">
                {t.featuredTitle}
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm">
                {t.featuredSub}
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('services')}
              className="mt-4 md:mt-0 text-emerald-800 hover:text-emerald-950 text-xs sm:text-sm font-bold flex items-center space-x-1.5 hover:underline cursor-pointer group shrink-0"
            >
              <span>{language === 'en' ? 'See All Care Packages' : 'सभी मातृत्व केयर पैकेजों की सूची'}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3" id="featured-remedies">
            {homepageFeatured.map((service) => (
              <div
                key={service.id}
                className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-stone-100">
                    <img
                      src={service.image}
                      alt={language === 'en' ? service.name : service.nameHindi}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-800 border border-stone-200">
                      {service.category.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="p-5 space-y-2.5">
                    <h3 className="text-lg font-bold text-stone-900 font-serif leading-tight">
                      {language === 'en' ? service.name : service.nameHindi}
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                      {language === 'en' ? service.description : service.descriptionHindi}
                    </p>
                    <div className="flex items-center space-x-4 pt-1 text-[10.5px] text-stone-500 font-mono">
                      <span>⏱ {service.duration} mins</span>
                      <span>•</span>
                      <span>{language === 'en' ? 'Fee' : 'फीस'}: ₹{service.priceInr.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between mt-auto">
                  <span className="text-emerald-800 font-serif font-black text-lg">
                    ₹{service.priceInr.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => onOpenBookingWithService(service.id)}
                    className="bg-emerald-800 hover:bg-emerald-900 text-stone-50 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    {language === 'en' ? 'Set Appointment' : 'अपॉइंटमेंट लें'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section validating safe caring */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="mx-auto max-w-7xl border-b border-stone-200 pb-16">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a16207] font-mono">
              {language === 'en' ? 'Reviews from Nurtured Mothers' : 'संतुष्ट माताओं के वास्तविक अनुभव'}
            </span>
            <h2 className="text-2.5xl sm:text-4xl font-bold tracking-tight text-stone-950">
              {language === 'en' ? 'Sanctum Stories of Peaceful Recovery' : 'मातृस्पर्श से स्वस्थ हुई माताओं की कहानियां'}
            </h2>
            <div className="h-0.5 w-16 bg-emerald-800 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {reviews && reviews.length > 0 ? (
              reviews.slice(0, 3).map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-4.5 w-4.5 fill-current text-amber-500" />
                      ))}
                    </div>
                    <p className="text-stone-650 text-xs sm:text-sm leading-relaxed italic">
                      "{language === 'en' ? rev.comment : (rev.commentHindi || rev.comment)}"
                    </p>
                    {rev.mediaUrl && (
                      <div className="rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 aspect-video max-h-36 relative flex items-center justify-center">
                        {rev.mediaType === 'video' ? (
                          <video src={rev.mediaUrl} className="w-full h-full object-cover" preload="metadata" />
                        ) : (
                          <img src={rev.mediaUrl} alt="Testimonial media" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-stone-900 font-serif">{rev.userName}</span>
                      <span className="block text-[9px] text-[10px] text-stone-400 font-sans">
                        {new Date(rev.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN')}
                      </span>
                    </div>
                    {rev.serviceName && (
                      <span className="bg-rose-50 text-[#a16207] border border-rose-100/50 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                        {rev.serviceName}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              [
                {
                  text: "Postpartum lower back stiffness had me in severe fatigue during the early weeks. Implementing their physical posture correction layouts and comfortable abdominal wraps in my home felt like an absolute relief. It stabilized my core.",
                  textHindi: "प्रसवोत्तर पीठ दर्द और थकावट ने मुझे शुरुआती हफ्तों में चलने में भी असमर्थ कर दिया था। घर पर विशेषज्ञ द्वारा निर्देशित शारीरिक मुद्रा सुधार व सुरक्षित सूती पेट की बेली रैपिंग ने मुझे अद्भुत स्थिरता व आराम प्रदान किया।",
                  name: "Karishma Sharma",
                  role: "Postpartum Mother (4 Weeks)",
                  stars: 5,
                  tag: "Posture Alignment / संरेखण"
                },
                {
                  text: "My newborn was crying continuously from wind gas. The lactation coordinator taught us correct swaddling wraps and supportive digestive schedule. Dev sleeps beautifully now!",
                  textHindi: "हमारा नवजात शिशु पेट में मरोड़ और अनिंद्रा के दर्द से परेशान रहता था। समन्वयक टीम ने हमें आरामदायक स्वैडलिंग (लपेटना) और पौष्टिक प्रसवोत्तर भोजन योजना सिखाई। देव अब बहुत आराम से सोता है!",
                  name: "Ananya Deshmukh",
                  role: "Parent of Baby Dev (6 Weeks)",
                  stars: 5,
                  tag: "Infant Sleep Support / शिशु नींद"
                },
                {
                  text: "Breastfeeding latching pains made me dread nursing. The lactation coordinator was remarkably patient, correcting my holding posture. My nursing journey is now fully comfortable!",
                  textHindi: "स्तनपान के समय गंभीर असहजता के कारण मैं काफी निराश हो गई थी। परामर्शदाता ने अत्यंत धैर्य के साथ हमारी बैठने की मुद्रा व बच्चे के मुंह के झुकाव को सुधारा। अब यह यात्रा पूरी तरह दर्द-रहित है!",
                  name: "Priyanka Iyer",
                  role: "First-Time Mother (2 Weeks)",
                  stars: 5,
                  tag: "Latching & Lactation / स्तनपान"
                }
              ].map((testi, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex text-amber-500">
                      {[...Array(testi.stars)].map((_, i) => (
                        <Star key={i} className="h-4.5 w-4.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed italic font-serif">
                      "{language === 'en' ? testi.text : testi.textHindi}"
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between font-sans">
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-stone-900 font-serif">{testi.name}</span>
                      <span className="block text-[10px] text-stone-500">{testi.role}</span>
                    </div>
                    <span className="bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      {testi.tag}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-12 bg-transparent">
            <button
              onClick={() => onNavigateToTab('testimonials')}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-stone-50 text-xs sm:text-sm font-bold uppercase tracking-wider transition hover:scale-[1.02] shadow-md cursor-pointer"
            >
              <span>{language === 'en' ? "View All Real-time Testimonials" : "सभी माताओं के अनुभव देखें"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
