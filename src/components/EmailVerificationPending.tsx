import React, { useState, useEffect } from 'react';
import { useFirebase } from './FirebaseProvider';
import { useLanguage } from './LanguageProvider';
import { Mail, RefreshCw, Send, LogOut, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function EmailVerificationPending() {
  const { user, resendSecondaryVerification, checkEmailVerificationStatus, logOut, error } = useFirebase();
  const { language } = useLanguage();
  
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [checking, setChecking] = useState<boolean>(false);
  const [localFeedback, setLocalFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manage cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLocalFeedback(null);
    try {
      await resendSecondaryVerification();
      setResendCooldown(30); // 30-second security cooldown
      setLocalFeedback({
        type: 'success',
        message: language === 'en'
          ? "A fresh verification link has been delivered to your maternal inbox."
          : "आपकी सुरक्षा हेतु एक नया सत्यापन कोड आपके ईमेल पते पर भेज दिया गया है।"
      });
    } catch (err: any) {
      setLocalFeedback({
        type: 'error',
        message: err?.message || (language === 'en' ? "Please wait before triggering another dispatch." : "कृपया दोबारा प्रयास करने से पहले कुछ क्षण प्रतीक्षा करें।")
      });
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setLocalFeedback(null);
    try {
      const isVerified = await checkEmailVerificationStatus();
      if (isVerified) {
        setLocalFeedback({
          type: 'success',
          message: language === 'en'
            ? "Maternal credentials verified successfully! Entering MaatriSparsh..."
            : "ईमेल सफलतापूर्वक सत्यापित हुआ! मातृत्व धाम में आपका स्वागत है..."
        });
      } else {
        setLocalFeedback({
          type: 'error',
          message: language === 'en'
            ? "We couldn't confirm the verification yet. Please click the link sent to your email and try again."
            : "हम अभी सत्यापन की पुष्टि नहीं कर पाए। कृपया अपने इनबॉक्स में प्राप्त क्रेडेंशियल लिंक पर क्लिक करें और पुनः जांचें।"
        });
      }
    } catch (err: any) {
      setLocalFeedback({
        type: 'error',
        message: err?.message || "Verification status check failed."
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-stone-50" id="maternal-verification-pending-screen">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-stone-100 shadow-xl rounded-2xl p-6 sm:p-8 space-y-6"
      >
        {/* Verification Icon Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-4 bg-amber-50 rounded-full text-amber-600 ring-4 ring-amber-50/50">
            <Mail className="h-8 w-8 text-amber-700 animate-pulse" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
            {language === 'en' ? 'Maternal Code Required' : 'ईमेल सत्यापन की आवश्यकता है'}
          </h2>
          <p className="text-xs text-stone-500 font-mono tracking-widest uppercase">
            MaatriSparsh Secure Gate
          </p>
        </div>

        {/* Warning / Core Message */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 text-center">
          <span className="text-stone-700 text-sm leading-relaxed block font-medium">
            {language === 'en'
              ? "Please verify your email before accessing your account."
              : "सुरक्षित मातृत्व रिकॉर्ड्स तक पहुँचने से पहले कृपया अपना ईमेल सत्यापित करें।"}
          </span>
          <p className="mt-2 text-xs text-stone-500">
            {language === 'en'
              ? "We sent a secure activation token to:"
              : "हमने आपकी सुरक्षा हेतु यहाँ एक लिंक भेजा है:"}
          </p>
          <span className="font-mono text-sm text-stone-900 border-b border-stone-200 pb-0.5 mt-1 inline-block font-semibold">
            {user?.email}
          </span>
        </div>

        {/* Dynamic Alerts */}
        {localFeedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3.5 rounded-xl text-xs flex items-start space-x-2.5 ${
              localFeedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' 
                : 'bg-rose-50 text-rose-800 border-l-4 border-rose-600'
            }`}
          >
            {localFeedback.type === 'success' ? (
              <CheckCircle className="h-4.5 w-4.5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5 text-rose-700 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed font-medium">{localFeedback.message}</span>
          </motion.div>
        )}

        {/* Action Controls */}
        <div className="space-y-3.5 pt-2">
          {/* Proceed / Check Status */}
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow transition duration-150 flex items-center justify-center space-x-2.5 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 text-stone-100 ${checking ? 'animate-spin' : ''}`} />
            <span>
              {checking 
                ? (language === 'en' ? 'Checking Link...' : 'सत्यापन की पुष्टि हो रही है...') 
                : (language === 'en' ? 'I have verified my email' : 'मैंने ईमेल सत्यापित कर लिया है')}
            </span>
          </button>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="w-full bg-stone-50 hover:bg-stone-100 text-stone-700 disabled:text-stone-400 font-semibold text-xs py-2.5 px-4 rounded-xl border border-stone-200 transition duration-150 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 shrink-0" />
            <span>
              {resendCooldown > 0 
                ? (language === 'en' ? `Resend available in ${resendCooldown}s` : `फिर भेजें (${resendCooldown} सेकंड)`)
                : (language === 'en' ? 'Resend Verification Email' : 'सत्यापन ईमेल पुनः भेजें')}
            </span>
          </button>
        </div>

        {/* Exit Gate */}
        <div className="border-t border-stone-100 pt-5 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center space-x-1">
            <HelpCircle className="h-3.5 w-3.5 text-stone-400" />
            <span>{language === 'en' ? 'Need assist?' : 'सहायता चाहिए?'}</span>
          </div>
          <button
            onClick={() => logOut()}
            className="text-stone-600 hover:text-stone-900 font-semibold transition duration-150 flex items-center space-x-1 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-stone-500" />
            <span>{language === 'en' ? 'Log out / Switch User' : 'लॉग आउट / दूसरा खाता'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
