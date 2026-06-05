import React, { useState, useRef } from 'react';
import { Star, Upload, FileVideo, CheckCircle2, ChevronRight, SlidersHorizontal, Sparkles, MessageSquareHeart, Eye, ShieldCheck, HeartPulse, Trash2, Pin, EyeOff, AlertCircle } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { useLanguage } from './LanguageProvider';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Review } from '../types';

export default function TestimonialsView() {
  const { user, userProfile, isAdmin, reviews, addReviewInFirestore, editReviewInFirestore, deleteReviewInFirestore, services } = useFirebase();
  const { language } = useLanguage();

  // Submission form states;
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState(userProfile?.motherName || user?.displayName || '');
  const [selectedService, setSelectedService] = useState('');
  const [childDetails, setChildDetails] = useState('');
  
  // Media upload states;
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Spam protection states;
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [securityNum1] = useState(Math.floor(Math.random() * 6) + 2);
  const [securityNum2] = useState(Math.floor(Math.random() * 5) + 1);
  const [spamNotice, setSpamNotice] = useState<string | null>(null);

  // Filter states;
  const [activeFilter, setActiveFilter] = useState<'all' | 'highest' | 'fivestar' | 'featured'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Submit flow control;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected review for preview
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Admin moderation fields in edit mode
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Media drag and drop states
  const [dragActive, setDragActive] = useState(false);

  // Form handle for drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  // Automatic client-side image compression utilizing canvas
  const compressImageAndGetBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const image = new Image();
        image.onload = () => {
          const maxDimension = 620;
          let width = image.width;
          let height = image.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }

          ctx.drawImage(image, 0, 0, width, height);
          
          // Highly optimized JPEG at low-weight 0.60 compression ratio to produce an ultra-compact ~10kb-35kb image
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.60);
          resolve(compressedDataUrl);
        };
        image.onerror = (err) => reject(err);
        image.src = readerEvent.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Processing the selected media file via robust secure client-side compression
  const handleFileSelected = async (file: File) => {
    setUploadError(null);
    // Limit to 10MB to verify integrity
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(language === 'en' ? 'Attachment exceeds 10MB limit. Select a smaller photo.' : 'फाइल १०MB से बड़ी है। कृपया छोटी फोटो चुनें।');
      return;
    }

    const type = file.type;
    const isImage = type.startsWith('image/');

    if (!isImage) {
      setUploadError(language === 'en' ? 'Only image files are supported for testimonials. Please select a photo.' : 'समीक्षा के लिए केवल फोटो (छवि) फ़ाइलें समर्थित हैं। कृपया एक फोटो चुनें।');
      return;
    }

    setMediaFile(file);
    setMediaType('image');
    setUploadProgress(20);

    try {
      setUploadProgress(60);
      const compressedBase64 = await compressImageAndGetBase64(file);
      setMediaUrl(compressedBase64);
      setUploadProgress(100);
      setUploadError(null);
    } catch (compressErr) {
      console.error("Local canvas image processing failed:", compressErr);
      setUploadError(language === 'en' ? 'Image processing failed. Please select another clean JPEG/PNG file.' : 'फोटो प्रोसेसिंग विफल रही। कृपया कोई अन्य फोटो बदलें।');
      setUploadProgress(null);
      setMediaFile(null);
      setMediaType('none');
    }
  };

  const handleResetForm = () => {
    setRating(5);
    setComment('');
    setReviewerName(userProfile?.motherName || user?.displayName || '');
    setSelectedService('');
    setChildDetails('');
    setMediaFile(null);
    setMediaUrl('');
    setMediaType('none');
    setUploadProgress(null);
    setUploadError(null);
    setSecurityAnswer('');
    setSpamNotice(null);
    setIsPreviewMode(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSpamNotice(language === 'en' ? 'Authentication expired. Please sign in to write an experience.' : 'सत्र समाप्त हो गया है। कृपया समीक्षा लिखने के लिए लॉगिन करें।');
      return;
    }

    if (comment.trim().length < 15) {
      setSpamNotice(language === 'en' ? 'Authentic feedback must contain at least 15 characters of content.' : 'सच्ची प्रतिक्रिया में कम से कम १५ अक्षर होने चाहिए।');
      return;
    }

    // Spam math verification block;
    const expectedAnswer = securityNum1 + securityNum2;
    if (Number(securityAnswer.trim()) !== expectedAnswer) {
      setSpamNotice(language === 'en' ? 'Incorrect security verification answer. Verification keeps postpartum records spam-free.' : 'सुरक्षा सत्यापन उत्तर गलत है। यह मातृत्व अभिलेखों को सुरक्षित रखता है।');
      return;
    }

    setIsSubmitting(true);
    setSpamNotice(null);

    try {
      await addReviewInFirestore({
        userId: user.uid,
        userName: reviewerName.trim() || userProfile?.motherName || user.email?.split('@')[0] || 'MaatriSparsh Mother',
        userEmail: user.email || '',
        rating,
        comment: comment.trim(),
        serviceName: selectedService,
        childName: childDetails.trim() || undefined,
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType !== 'none' ? mediaType : undefined,
      });

      setSuccessMsg(language === 'en' ? 'Your healing testimonial was submitted successfully! It will appear on our sanctum page once approved by our postpartum caretakers.' : 'आपका अनुभव सफलतापूर्वक दर्ज किया गया! प्रशासकों द्वारा जाँच के बाद यह यहाँ प्रदर्शित होगा।');
      handleResetForm();
      setTimeout(() => {
        setSuccessMsg(null);
        setShowSubmitModal(false);
      }, 6000);
    } catch (err: any) {
      console.error(err);
      setSpamNotice(err?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtering reviews according to active settings;
  const filteredReviews = reviews.filter(rev => {
    if (activeFilter === 'highest') return rev.rating >= 4;
    if (activeFilter === 'fivestar') return rev.rating === 5;
    if (activeFilter === 'featured') return rev.isFeatured;
    return true;
  }).filter(rev => {
    if (!searchQuery) return true;
    const queryLower = searchQuery.toLowerCase();
    const commentMatch = rev.comment.toLowerCase().includes(queryLower);
    const serviceMatch = rev.serviceName?.toLowerCase().includes(queryLower);
    const authorMatch = rev.userName.toLowerCase().includes(queryLower);
    return commentMatch || serviceMatch || authorMatch;
  });

  // Admin approval controllers;
  const handleToggleApprove = async (review: Review) => {
    const newStatus = review.status === 'Approved' ? 'Pending' : 'Approved';
    try {
      await editReviewInFirestore(review.id, { status: newStatus });
    } catch (err) {
      console.error("Review state update failed", err);
    }
  };

  const handleToggleFeatured = async (review: Review) => {
    try {
      await editReviewInFirestore(review.id, { isFeatured: !review.isFeatured });
    } catch (err) {
      console.error("Review state pin failed", err);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm(language === 'en' ? "Are you sure you want to permanently delete this testimonial from MaatriSparsh records?" : "क्या आप वास्तव में इस अनुभव को रिकॉर्ड से हटाना चाहते हैं?")) {
      try {
        await deleteReviewInFirestore(reviewId);
      } catch (err) {
        console.error("Failed to delete review", err);
      }
    }
  };

  return (
    <div className="py-12 bg-stone-50 min-h-screen" id="testimonials-view-container">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Aesthetic Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF1F2] border border-rose-150 rounded-full text-xs font-semibold tracking-wider text-[#a16207] uppercase">
            <Sparkles className="h-4.5 w-4.5 text-[#ca8a04] shrink-0 animate-pulse" />
            <span>{language === 'en' ? 'Sacred Mother Reviews' : 'माताओं की सच्ची अनुभूतियां'}</span>
          </div>
          
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
            {language === 'en' ? 'Stories of Graceful Postnatal ' : 'सुरक्षित मातृत्व एवं प्रसवोत्तर '}
            <span className="text-emerald-850 underline decoration-[#ca8a04] decoration-2 underline-offset-4">
              {language === 'en' ? 'Healing & Recovery' : 'स्वास्थ्य लाभ के अनुभव'}
            </span>
          </h1>
          
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {language === 'en' 
              ? 'Every postpartum mother has a personal labor recovery journey. From therapeutic Sutika Abhyanga to lactation coordination, browse reviews verified by our Raipur headquarters.'
              : 'हर माँ की प्रसव उपरांत स्वास्थ्य लाभ की अपनी यात्रा होती है। सौम्य अभ्यंग मालिश से लेकर स्तनपान मार्गदर्शन तक, हमारी रायपुर सुतिका टीम द्वारा सत्यापित अनुभवों को पढ़ें।'}
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                if (!user) {
                  alert(language === 'en' ? "Please click 'Sign In' in the top bar before scheduling or sharing your postpartum story!" : "अनुभव साझा करने या बुकिंग करने के लिए कृपया सबसे ऊपर 'साइन इन करें' बटन पर क्लिक करें!");
                } else {
                  handleResetForm();
                  setShowSubmitModal(true);
                }
              }}
              className="inline-flex items-center space-x-2 justify-center px-6 py-3 rounded-full bg-emerald-800 text-stone-50 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-emerald-900 transition shadow-md active:scale-95 duration-150 cursor-pointer"
            >
              <MessageSquareHeart className="h-4.5 w-4.5 text-[#FFE4E6]" />
              <span>{language === 'en' ? 'Share Your Recovery Story' : 'अपना अनुभव साझा करें'}</span>
            </button>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border border-stone-200 rounded-3xl mb-10 shadow-xs text-center">
          <div>
            <span className="block font-serif text-2xl sm:text-3xl font-black text-stone-900">4.95★</span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-500 font-bold block mt-1">
              {language === 'en' ? 'Average Rating' : 'औसत रेटिंग'}
            </span>
          </div>
          <div className="border-l border-stone-100">
            <span className="block font-serif text-2xl sm:text-3xl font-black text-stone-900">100%</span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#a16207] font-bold block mt-1">
              {language === 'en' ? 'Nurture Standard' : 'सुरक्षित मातृत्व मानक'}
            </span>
          </div>
          <div className="border-l border-stone-100">
            <span className="block font-serif text-2xl sm:text-3xl font-black text-stone-900">1.8k+</span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-850 font-bold block mt-1">
              {language === 'en' ? 'Mothers Guided' : 'संतुष्ट माताएं'}
            </span>
          </div>
          <div className="border-l border-stone-100">
            <span className="block font-serif text-2xl sm:text-3xl font-black text-stone-900">Raipur</span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-bold block mt-1">
              {language === 'en' ? 'Sanctum Hub' : 'मुख्य केंद्र'}
            </span>
          </div>
        </div>

        {/* Filters and Search toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-stone-100 rounded-2xl border border-stone-200 mb-8 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 mr-2 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#ca8a04]" />
              {language === 'en' ? 'Filter:' : 'फ़िल्टर:'}
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
                activeFilter === 'all' 
                  ? 'bg-[#ca8a04] text-white shadow-xs' 
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {language === 'en' ? 'ALL REVIEWS' : 'सभी अनुभव'}
            </button>
            <button
              onClick={() => setActiveFilter('featured')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
                activeFilter === 'featured' 
                  ? 'bg-emerald-800 text-white shadow-xs' 
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {language === 'en' ? 'PINNED / FEATURED' : 'पिंड / मुख्य कहानियां'}
            </button>
            <button
              onClick={() => setActiveFilter('highest')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
                activeFilter === 'highest' 
                  ? 'bg-stone-850 text-white shadow-xs' 
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {language === 'en' ? 'HIGH RATED (4★+)' : 'उच्च रेटिंग (४★+)'}
            </button>
            <button
              onClick={() => setActiveFilter('fivestar')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
                activeFilter === 'fivestar' 
                  ? 'bg-rose-500 text-white shadow-xs' 
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {language === 'en' ? '5-STAR ONLY' : 'केवल ५-स्टार'}
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder={language === 'en' ? 'Search experiences...' : 'खोजें...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-2 rounded-xl bg-white border border-stone-250 text-stone-800 text-xs focus:ring-2 focus:ring-[#ca8a04] outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs hover:text-stone-750"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* REVIEWS GRID PANEL */}
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-3xl max-w-xl mx-auto space-y-4 shadow-2xs">
            <MessageSquareHeart className="h-10 w-10 text-stone-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {language === 'en' ? 'No postpartum stories found' : 'कोई प्रसवोत्तर अनुभव नहीं मिला'}
            </h3>
            <p className="text-stone-500 text-xs">
              {language === 'en' 
                ? 'Try adjusting filters or submit the first testimonial experienced with MaatriSparsh therapeutic service.' 
                : 'कृपया अन्य फ़िल्टर का चयन करें अथवा अपनी सेवा का पहला अनुभव हमारे साथ साझा करें।'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="testimonials-card-grid">
            {filteredReviews.map((rev) => (
              <motion.div
                key={rev.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 hover:shadow-md flex flex-col justify-between ${
                  rev.isFeatured 
                    ? 'border-[#ca8a04]/60 bg-[#FFFCFA]' 
                    : 'border-stone-150 bg-white'
                }`}
              >
                {/* Pin ornament for featured comments */}
                {rev.isFeatured && (
                  <div className="absolute top-4 right-4 flex items-center space-x-1 px-2.5 py-1 bg-[#ca8a04]/10 text-[#a16207] rounded-full border border-[#ca8a04]/30 text-[9px] uppercase font-mono font-bold tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    <span>{language === 'en' ? 'Caretaker Favorite' : 'अनुशंसित'}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Star row */}
                  <div className="flex items-center space-x-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx} 
                        className={`h-4.5 w-4.5 ${
                          idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                        }`} 
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-stone-750 text-xs sm:text-sm leading-relaxed font-serif italic text-justify">
                    "{language === 'en' ? rev.comment : (rev.commentHindi || rev.comment)}"
                  </p>

                  {/* Render optional media attachments (securely uploaded or base64) */}
                  {rev.mediaUrl && (
                    <div className="mt-2.5 rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 relative group aspect-video max-h-48 flex items-center justify-center">
                      {rev.mediaType === 'video' ? (
                        <video 
                          src={rev.mediaUrl} 
                          controls 
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                      ) : (
                        <img 
                          src={rev.mediaUrl} 
                          alt="Testimonial media" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  )}

                  {/* Tags for service experienced */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {rev.serviceName && (
                      <span className="px-2.5 py-1 rounded-full bg-[#FFF1F2] border border-rose-100 text-[#a16207] text-[10px] font-bold">
                        {rev.serviceName}
                      </span>
                    )}
                    {rev.childName && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-850 text-[10px] font-bold font-sans">
                        🍼 {rev.childName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 mt-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-sans font-bold text-[#a16207] text-xs block">
                        {rev.userName}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-stone-400">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-500">
                        {language === 'en' ? 'Verified Postnatal' : 'सत्यापित सहेली'}
                      </span>
                    </div>
                  </div>

                  {/* Render Admin Controls inside the individual cards */}
                  {isAdmin && (
                    <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-[10px] font-mono">
                      <div className="text-stone-500 font-bold tracking-wider text-[8px] uppercase">Review Moderation Console:</div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleToggleApprove(rev)}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${
                            rev.status === 'Approved' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {rev.status === 'Approved' ? 'HIDE REVIEW' : 'APPROVE'}
                        </button>

                        <button
                          onClick={() => handleToggleFeatured(rev)}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase flex items-center space-x-1 ${
                            rev.isFeatured
                              ? 'bg-amber-100 text-[#a16207] border border-amber-300 hover:bg-amber-150'
                              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                        >
                          <Pin className="h-2.5 w-2.5 shrink-0" />
                          <span>{rev.isFeatured ? 'UNPIN' : 'PIN TO TOP'}</span>
                        </button>

                        <button
                          onClick={() => setEditingReview(rev)}
                          className="px-2 py-1 rounded-md text-[9px] bg-sky-100 text-sky-850 border border-sky-300 hover:bg-sky-200 font-bold uppercase"
                        >
                          EDIT
                        </button>

                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="px-2 py-1 rounded-md text-[9px] bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 font-bold uppercase flex items-center space-x-1"
                        >
                          <Trash2 className="h-2.5 w-2.5 shrink-0" />
                          <span>DELETE</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 text-[9px] text-stone-400 gap-1 mt-1">
                        <div>Status: <span className={`font-bold ${rev.status === 'Approved' ? 'text-emerald-700' : 'text-amber-600'}`}>{rev.status}</span></div>
                        <div>Email: {rev.userEmail}</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FORM TESTIMONIAL SUBMIT MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full border border-stone-250 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              
              {/* Form Entry Column */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[90vh] md:max-h-[85vh]">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                  <h3 className="font-serif text-lg font-extrabold text-stone-900 flex items-center space-x-2">
                    <MessageSquareHeart className="h-5 w-5 text-rose-500 animate-pulse shrink-0" />
                    <span>{language === 'en' ? 'Share Postnatal Recovery' : 'अपना स्वास्थ्य लाभ अनुभव दर्ज करें'}</span>
                  </h3>
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="text-stone-400 hover:text-stone-700 font-bold font-mono text-sm p-1.5 hover:bg-stone-50 rounded-full"
                  >
                    ✕
                  </button>
                </div>

                {successMsg ? (
                  <div className="p-6 text-center space-y-4">
                    <div className="mx-auto rounded-full bg-emerald-50 text-emerald-800 p-3 w-12 h-12 flex items-center justify-center border border-emerald-300">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h4 className="font-serif font-bold text-stone-900">
                      {language === 'en' ? 'Postpartum Record Received!' : 'अनुभव सफलतापूर्वक सुरक्षित!'}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed text-justify">{successMsg}</p>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-150 inline-flex items-center space-x-1 text-[10px] text-stone-500 font-mono">
                      <span>Ref Raipur Sanctum Registry</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    
                    {/* Star Slider */}
                    <div>
                      <label className="block text-stone-700 text-xs font-bold uppercase tracking-wider mb-2">
                        {language === 'en' ? 'Overall Care Score:' : 'सेवा रेटिंग स्कोर:'}
                      </label>
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: 5 }).map((_, idx) => {
                          const val = idx + 1;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setRating(val)}
                              onMouseEnter={() => setHoverRating(val)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="p-1 focus:outline-none transition cursor-pointer"
                            >
                              <Star 
                                className={`h-8 w-8 ${
                                  val <= (hoverRating ?? rating) 
                                    ? 'fill-amber-400 text-amber-400 scale-105' 
                                    : 'text-stone-200'
                                }`} 
                              />
                            </button>
                          );
                        })}
                        <span className="text-xs font-mono text-stone-400 ml-2">({rating} of 5)</span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-stone-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                        {language === 'en' ? 'Describe your healing journey (Abhyanga response, lactation counciling effects...):' : 'अपनी स्वास्थ्य लाभ यात्रा का वर्णन करें:'}
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={language === 'en' ? "Tell other postnatal moms about your Abhyanga physical restores, pelvis wrap feeling, or pediatric counselings..." : "पारंपरिक तेल मालिश या नवजात संरक्षण पर अपनी प्रतिक्रिया लिखें..."}
                        rows={4}
                        required
                        className="w-full text-xs p-3 rounded-2xl bg-stone-50 border border-stone-250 text-stone-850 focus:ring-2 focus:ring-[#ca8a04] outline-none"
                      />
                      <span className="text-[10px] text-stone-400 font-mono block text-right mt-1">
                        {comment.length} / 10000 characters (Min 15 required)
                      </span>
                    </div>

                    {/* Dual col */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-stone-700 text-xs font-bold uppercase tracking-wider mb-1">
                          {language === 'en' ? 'Mother Name (Optional):' : 'माँ का नाम (वैकल्पिक):'}
                        </label>
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder={language === 'en' ? 'e.g. Aradhya Sharma' : 'उदा. आराध्या शर्मा'}
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-250 text-stone-850 font-sans focus:ring-2 focus:ring-[#ca8a04] outline-none"
                        />
                      </div>

                      {/* Baby tag */}
                      <div>
                        <label className="block text-stone-700 text-xs font-bold uppercase tracking-wider mb-1">
                          {language === 'en' ? 'Baby Name / Age (Optional):' : 'शिशु का नाम / उम्र (वैकल्पिक):'}
                        </label>
                        <input
                          type="text"
                          value={childDetails}
                          onChange={(e) => setChildDetails(e.target.value)}
                          placeholder={language === 'en' ? 'e.g. Kabir, 4 weeks old' : 'उदा. कबीर, ४ सप्ताह'}
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-250 text-stone-850 focus:ring-2 focus:ring-[#ca8a04] outline-none"
                        />
                      </div>
                    </div>

                    {/* Postpartum Service experienced */}
                    <div>
                      <label className="block text-stone-700 text-xs font-bold uppercase tracking-wider mb-1">
                        {language === 'en' ? 'Which MaatriSparsh Care Package experienced?' : 'मातृस्पर्श का कौन सा केयर पैकेज लिया?'}
                      </label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-250 text-stone-850 focus:ring-2 focus:ring-[#ca8a04] outline-none"
                      >
                        <option value="">{language === 'en' ? '-- Select Service experienced --' : '-- अनुभव किया गया पैकेज चुनें --'}</option>
                        {services.map(s => (
                          <option key={s.id} value={language === 'en' ? s.name : s.nameHindi}>
                            {language === 'en' ? s.name : s.nameHindi}
                          </option>
                        ))}
                        <option value="Abhyanga Recovery">{language === 'en' ? 'Abhyanga Recovery' : 'अभ्यंग स्वास्थ्य लाभ'}</option>
                        <option value="Sutika Snana Ritual">{language === 'en' ? 'Traditional Sutika Snana' : 'पारंपरिक सुतिका स्नान अनुष्ठान'}</option>
                        <option value="Lactation Counselings">{language === 'en' ? 'Expert Lactation counseling' : 'स्तनपान एवं लैक्टेशन परामर्श'}</option>
                        <option value="Infant Colic Massage">{language === 'en' ? 'Infant Massage' : 'शिशु मालिश'}</option>
                      </select>
                    </div>

                    {/* DRAG AND DROP MEDIA ATTACHMENT */}
                    <div>
                      <label className="block text-stone-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                        {language === 'en' ? 'Attach Recovery Photo or Short Video (Optional):' : 'शांतिपूर्ण प्रसवोत्तर फोटो या वीडियो संलग्न करें:'}
                      </label>
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                          dragActive 
                            ? 'border-[#ca8a04] bg-amber-50' 
                            : 'border-stone-250 bg-stone-50 hover:bg-stone-100'
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*,video/*"
                          className="hidden"
                        />
                        <div className="space-y-1.5 text-stone-500">
                          <Upload className="h-5 w-5 text-[#ca8a04] mx-auto" />
                          <p className="text-[11px]">
                            {language === 'en' 
                              ? 'Drag & drop image/video here, or click to browse.' 
                              : 'यहाँ फोटो/वीडियो खींचें या ब्राउज़ करें।'}
                          </p>
                          <p className="text-[9px] text-stone-400">Max size 10MB (MPEG, MP4, JPEG, PNG, etc)</p>
                        </div>
                      </div>

                      {/* Display attachment status or upload indicators */}
                      {uploadProgress !== null && (
                        <div className="mt-2.5 p-2 bg-stone-100 rounded-xl border border-stone-200">
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                            <span className="text-stone-500 flex items-center gap-1">
                              {mediaType === 'video' ? <FileVideo className="h-3.5 w-3.5 text-rose-500" /> : '📸'}
                              {mediaFile?.name || 'Local file attachment'}
                            </span>
                            <span className="font-bold text-[#ca8a04]">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-700 h-1.5" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        </div>
                      )}

                      {uploadError && (
                        <div className="mt-2.5 text-[10px] text-red-600 font-mono flex items-center space-x-1 leading-none">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{uploadError}</span>
                        </div>
                      )}
                    </div>

                    {/* SPAM BOT VERIFICATION MATH QUESTION */}
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 shadow-3xs">
                      <label className="block text-[#a16207] text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                        🛡️ {language === 'en' ? 'Postmaster Spam Verification Riddle (Anti-Bot):' : 'सुरक्षा सत्यापन (एंटी-बॉट):'}
                      </label>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs text-stone-600 font-bold bg-white px-2.5 py-1 rounded border border-stone-200">
                          {securityNum1} + {securityNum2} = ?
                        </span>
                        <input
                          type="text"
                          required
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          placeholder="Solve..."
                          className="w-24 text-xs px-2.5 py-1 rounded bg-white border border-stone-250 focus:ring-1 focus:ring-[#ca8a04]"
                        />
                      </div>
                    </div>

                    {/* Notice bar */}
                    {spamNotice && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-150 text-justify">
                        {spamNotice}
                      </div>
                    )}

                    {/* Submit Controllers with preview toggles */}
                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className="flex-1 px-4 py-2.5 rounded-full border border-stone-250 text-stone-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{isPreviewMode ? (language === 'en' ? 'Hide Live Preview' : 'समीक्षा संपादित करें') : (language === 'en' ? 'Live Card Preview' : 'जीवंत पूर्वावलोकन')}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || (uploadProgress !== null && uploadProgress < 100)}
                        className="flex-1 px-4 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-stone-50 text-xs font-bold uppercase tracking-wider shadow-sm transition active:scale-98 cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>{isSubmitting ? (language === 'en' ? 'Submitting...' : 'भेजा जा रहा है...') : (language === 'en' ? 'Secure Submit' : 'सुरक्षित भेजें')}</span>
                      </button>
                    </div>

                  </form>
                )}
              </div>

              {/* Live Preview Panel Column */}
              <AnimatePresence>
                {isPreviewMode && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '300px', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="bg-[#FFFDFC] border-l border-stone-200 p-6 hidden md:flex flex-col justify-between shrink-0"
                  >
                    <div>
                      <div className="text-[9px] uppercase tracking-wider font-mono font-bold text-amber-600 block mb-3 flex items-center space-x-1">
                        <Sparkles className="h-3 w-3" />
                        <span>{language === 'en' ? 'Sanctum Testimonial Preview' : 'समीक्षा कार्ड पूर्वावलोकन'}</span>
                      </div>

                      {/* Review Preview card mimicking live grid layout */}
                      <div className="p-4 bg-white border border-[#ca8a04]/40 rounded-2xl relative shadow-xs">
                        <span className="block text-[8px] uppercase font-mono tracking-widest text-[#a16207] bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 absolute top-3.5 right-3.5">
                          {language === 'en' ? 'Approved' : 'पूर्वदिखावा'}
                        </span>

                        <div className="space-y-3.5">
                          <div className="flex items-center space-x-0.5 mt-1">
                            {Array.from({ length: rating }).map((_, idx) => (
                              <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>

                          <p className="font-serif italic text-[11px] leading-relaxed text-stone-700 min-h-12 overflow-hidden break-words">
                            "{comment || (language === 'en' ? 'Write testimonial comment on the left to view a realtime postpartum card preview...' : 'सुतिका थेरेपी व मातृत्व संरक्षण पर अपना प्यारा सा अनुभव लिखें...')}"
                          </p>

                          {mediaUrl && (
                            <div className="rounded-xl overflow-hidden aspect-video border border-stone-100 max-h-24 relative flex items-center justify-center bg-stone-50">
                              {mediaType === 'video' ? (
                                <FileVideo className="h-6 w-6 text-rose-500 animate-pulse" />
                              ) : (
                                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1">
                            {selectedService && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-[#a16207] text-[8px] font-bold">
                                {selectedService}
                              </span>
                            )}
                            {childDetails && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-850 text-[8px] font-bold">
                                🍼 {childDetails}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-stone-50 pt-2.5 mt-3.5 flex items-center justify-between">
                          <div>
                            <span className="font-sans font-bold text-[#a16207] text-[10px] block">
                              {reviewerName || 'Postnatal Mother'}
                            </span>
                            <span className="text-[8px] text-stone-400 font-mono">
                              Today
                            </span>
                          </div>
                          <div className="flex items-center space-x-0.5 text-stone-400 shrink-0 scale-90">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-[7.5px] uppercase tracking-wider font-mono font-bold text-stone-500">
                              Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] text-stone-400 text-center flex items-center justify-center space-x-1.5 mt-4">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#ca8a04]" />
                      <span>{language === 'en' ? ' Raipur Sanctum Protected' : 'रायपुर मातृत्व केंद्र'}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN EDIT TESTIMONIAL MODAL */}
      <AnimatePresence>
        {editingReview && (
          <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full border border-stone-250 shadow-2xl overflow-hidden p-6"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <h3 className="font-serif text-lg font-extrabold text-[#a16207] flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-800 shrink-0" />
                  <span>Admin: Edit Postpartum Testimonial</span>
                </h3>
                <button
                  onClick={() => setEditingReview(null)}
                  className="text-stone-400 hover:text-stone-700 font-bold font-mono text-sm p-1.5 hover:bg-stone-50 rounded-full"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* 1. Reviewer Name */}
                <div>
                  <label className="block text-stone-700 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                    Caretaker Reviewer Name:
                  </label>
                  <input
                    type="text"
                    value={editingReview.userName}
                    onChange={(e) => setEditingReview({ ...editingReview, userName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-250 text-stone-850 rounded-xl focus:ring-1 focus:ring-emerald-850 outline-none"
                  />
                </div>

                {/* 2. Star Score */}
                <div>
                  <label className="block text-stone-700 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                    Star Score Rating:
                  </label>
                  <select
                    value={editingReview.rating}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-250 text-stone-850 rounded-xl focus:ring-1 focus:ring-emerald-850 outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(v => (
                      <option key={v} value={v}>{v} Stars</option>
                    ))}
                  </select>
                </div>

                {/* 3. Service experienced dropdown / input */}
                <div>
                  <label className="block text-stone-700 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                    Care Service experienced:
                  </label>
                  <input
                    type="text"
                    value={editingReview.serviceName || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, serviceName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-250 text-stone-850 rounded-xl focus:ring-1 focus:ring-emerald-850 outline-none"
                    placeholder="e.g. Traditional Sutika Abhyanga"
                  />
                </div>

                {/* 4. Child details */}
                <div>
                  <label className="block text-stone-700 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                    Child Details / Name tag:
                  </label>
                  <input
                    type="text"
                    value={editingReview.childName || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, childName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-250 text-stone-850 rounded-xl focus:ring-1 focus:ring-emerald-850 outline-none"
                    placeholder="e.g. Aradhya, 6 weeks old"
                  />
                </div>

                {/* 5. Healing comment journey text */}
                <div>
                  <label className="block text-stone-700 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                    Testimonial Comment:
                  </label>
                  <textarea
                    value={editingReview.comment}
                    onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                    rows={4}
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-250 text-stone-850 rounded-xl focus:ring-1 focus:ring-emerald-850 outline-none"
                  />
                </div>

                {/* 6. Secure media URL */}
                <div>
                  <label className="block text-stone-700 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                    Direct Attachment Media URL / Link:
                  </label>
                  <input
                    type="text"
                    value={editingReview.mediaUrl || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, mediaUrl: e.target.value, mediaType: e.target.value ? (editingReview.mediaType !== 'none' ? editingReview.mediaType : 'image') : 'none' })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-250 text-stone-850 rounded-xl focus:ring-1 focus:ring-emerald-850 outline-none"
                    placeholder="http://example.com/image.jpg"
                  />
                  <div className="flex items-center space-x-4 mt-1">
                    <label className="text-[10px] text-stone-500 flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="adminMediaType" 
                        checked={editingReview.mediaType === 'image'} 
                        onChange={() => setEditingReview({ ...editingReview, mediaType: 'image' })} 
                      />
                      <span>Image</span>
                    </label>
                    <label className="text-[10px] text-stone-500 flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="adminMediaType" 
                        checked={editingReview.mediaType === 'video'} 
                        onChange={() => setEditingReview({ ...editingReview, mediaType: 'video' })} 
                      />
                      <span>Video</span>
                    </label>
                    <label className="text-[10px] text-stone-500 flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="adminMediaType" 
                        checked={editingReview.mediaType === 'none' || !editingReview.mediaUrl} 
                        onChange={() => setEditingReview({ ...editingReview, mediaType: 'none', mediaUrl: '' })} 
                      />
                      <span>None</span>
                    </label>
                  </div>
                </div>

                {/* 7. Moderation status & Featured */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-stone-700 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                      Moderation Status:
                    </label>
                    <select
                      value={editingReview.status}
                      onChange={(e) => setEditingReview({ ...editingReview, status: e.target.value as any })}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-250 text-stone-850 rounded-xl focus:ring-1 focus:ring-emerald-850 outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 pt-5">
                    <input
                      type="checkbox"
                      id="adminIsFeatured"
                      checked={editingReview.isFeatured}
                      onChange={(e) => setEditingReview({ ...editingReview, isFeatured: e.target.checked })}
                      className="h-4 w-4 text-emerald-800 border-stone-300 rounded focus:ring-emerald-850 cursor-pointer"
                    />
                    <label htmlFor="adminIsFeatured" className="text-stone-700 text-xs font-bold uppercase tracking-wider select-none cursor-pointer">
                      💥 Pin Featured
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="flex-1 py-2 rounded-full border border-stone-250 text-stone-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (editingReview) {
                        try {
                          const { id, ...updates } = editingReview;
                          await editReviewInFirestore(id, updates);
                          setEditingReview(null);
                        } catch (err) {
                          console.error("Failed to save admin edits:", err);
                        }
                      }
                    }}
                    className="flex-1 py-2 rounded-full bg-emerald-800 hover:bg-emerald-950 text-stone-50 text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
