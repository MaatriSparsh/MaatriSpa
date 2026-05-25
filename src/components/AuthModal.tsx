import React, { useState, FormEvent, useEffect } from 'react';
import { useFirebase } from './FirebaseProvider';
import { X, Mail, Lock, User, Phone, Sparkles, AlertCircle, CheckCircle, ShieldCheck, Heart, Sparkle, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'phone-start' | 'phone-verify';

export default function AuthModal({ onClose, onSuccess, initialMode = 'signin' }: AuthModalProps) {
  const { signUpWithEmail, signInWithEmail, signInWithGoogle, sendPasswordReset, setupRecaptcha, signInWithPhone, verifyPhoneCode, error: firebaseError } = useFirebase();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isPhoneAuth, setIsPhoneAuth] = useState(false);
  const [phoneSubMode, setPhoneSubMode] = useState<'signin' | 'signup'>('signin');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [motherName, setMotherName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  
  // Countdown timers & Resend
  const [timer, setTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  
  // Component level states
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize reCAPTCHA verifier for phone auth
  useEffect(() => {
    const timerId = setTimeout(() => {
      setupRecaptcha('recaptcha-verifier');
    }, 500);
    return () => clearTimeout(timerId);
  }, [setupRecaptcha]);

  // Handle countdown for verify timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (mode === 'phone-verify' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, timer]);

  // Handle Separate OTP Box key entries
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric entries
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue) {
      const newOtp = [...otpDigits];
      newOtp[index] = '';
      setOtpDigits(newOtp);
      return;
    }

    const singleDigit = cleanValue.charAt(cleanValue.length - 1);
    const newOtp = [...otpDigits];
    newOtp[index] = singleDigit;
    setOtpDigits(newOtp);

    // Auto-focus next input field
    if (index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otpDigits];
      if (otpDigits[index] === '' && index > 0) {
        newOtp[index - 1] = '';
        setOtpDigits(newOtp);
        const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
        prevInput?.focus();
      } else {
        newOtp[index] = '';
        setOtpDigits(newOtp);
      }
    }
  };

  const normalizePhoneInput = (raw: string) => {
    const cleaned = raw.replace(/[^\d]/g, '');
    return cleaned;
  };

  const validatePhone = (num: string) => {
    const cleaned = normalizePhoneInput(num);
    return cleaned.length === 10 && /^[6-9]/.test(cleaned);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);
    setLoading(true);

    try {
      if (!isPhoneAuth) {
        // Standard Email Flow
        if (mode === 'signup') {
          if (!email || !password || !motherName || !phone) {
            throw new Error('Please fill in all required MaatriSparsh registration fields.');
          }
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match.');
          }
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters.');
          }
          
          await signUpWithEmail(email, password, motherName, phone);
          setLocalSuccess('Maternal account registered! Check your inbox for a secure verification link before entering the sanctuary.');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 3000);
        } else if (mode === 'signin') {
          if (!email || !password) {
            throw new Error('Please enter both your registered email and secure password.');
          }
          await signInWithEmail(email, password);
          setLocalSuccess('Welcome back to MaatriSparsh Sanctuary!');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 1500);
        } else if (mode === 'forgot-password') {
          if (!email) {
            throw new Error('Please enter your email to reset password.');
          }
          await sendPasswordReset(email);
          setLocalSuccess('Password reset link sent to your email.');
          setTimeout(() => {
            setMode('signin');
          }, 2000);
        }
      } else {
        // Phone Auth Flow
        if (mode === 'phone-start') {
          if (!phone) {
            throw new Error('Please enter your 10-digit mobile number.');
          }
          if (!validatePhone(phone)) {
            throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
          }
          
          const normalizedPhone = `+91${normalizePhoneInput(phone)}`;
          
          if (phoneSubMode === 'signup') {
            if (!motherName) {
              throw new Error("Please enter your full legal name for profile registration.");
            }
          }

          await signInWithPhone(
            normalizedPhone, 
            phoneSubMode === 'signup', 
            phoneSubMode === 'signup' ? { fullName: motherName, email: email } : undefined
          );

          setLocalSuccess('OTP security code sent successfully via SMS.');
          setTimer(30);
          setCanResend(false);
          setOtpDigits(['', '', '', '', '', '']);
          setMode('phone-verify');
        } else if (mode === 'phone-verify') {
          const verificationCode = otpDigits.join('');
          if (verificationCode.length !== 6) {
            throw new Error('Please enter the complete 6-digit OTP configuration.');
          }
          await verifyPhoneCode(verificationCode);
          setLocalSuccess('Phone number verified! Dynamic user session active.');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error(err);
      setLocalError(err?.message || 'Verification or profile registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLocalError(null);
    setLocalSuccess(null);
    setLoading(true);
    try {
      const normalizedPhone = `+91${normalizePhoneInput(phone)}`;
      await signInWithPhone(
        normalizedPhone,
        phoneSubMode === 'signup',
        phoneSubMode === 'signup' ? { fullName: motherName, email: email } : undefined
      );
      setLocalSuccess('OTP verification code resent successfully.');
      setTimer(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to resend SMS code block.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setLocalSuccess(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setLocalSuccess('Successfully authenticated via Google Identity!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setLocalError(err?.message || 'Google authentication cancelled by user.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setLocalError(null);
    const randomId = Math.floor(1000 + Math.random() * 9000);
    
    if (!isPhoneAuth) {
      if (mode === 'signin') {
        setEmail('demo.mother@maatrisparsh.com');
        setPassword('demo123456');
        setLocalSuccess('Pre-filled MaatriSparsh demo account! Click Sign In to continue.');
      } else {
        setMotherName('Aishwarya Roy');
        setPhone('9876543210');
        setEmail(`aishwarya.${randomId}@maatrisparsh.com`);
        setPassword('secure9876');
        setConfirmPassword('secure9876');
        setLocalSuccess('Pre-filled fresh registration values. Click Register to join.');
      }
    } else {
      if (phoneSubMode === 'signin') {
        setPhone('9999999999');
        setLocalSuccess('Pre-filled phone sign in coordinates.');
      } else {
        setMotherName('Prerna Sharma');
        setPhone('98765' + randomId);
        setEmail(`prerna.${randomId}@maatrisparsh.com`);
        setLocalSuccess('Pre-filled phone sign up. Click Send Verification to trigger SMS validation.');
      }
    }
    setTimeout(() => {
      setLocalSuccess(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" id="auth-modal-overlay">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[88vh] sm:max-h-[90vh]" id="auth-modal-card">
        
        {/* Decorative Top Accent Bar */}
        <div className="bg-gradient-to-r from-emerald-800 to-rose-400 h-2 w-full shrink-0" />

        {/* Modal Header */}
        <div className="px-5 pt-4.5 pb-3.5 bg-gradient-to-b from-stone-50 to-white border-b border-stone-100 flex flex-col shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <Heart className="h-3.5 w-3.5 fill-current" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#B5826F]">MaatriSparsh Sanctuary</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="mt-2">
            <h3 className="font-serif text-lg font-black text-stone-900 tracking-tight leading-snug">
              {isPhoneAuth 
                ? mode === 'phone-verify' ? 'OTP verification code' : phoneSubMode === 'signup' ? 'Create Account with Phone' : 'Sign In with Phone'
                : mode === 'signin' ? 'Sign In' 
                : mode === 'signup' ? 'Create Account' 
                : 'Reset Password'}
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
              {isPhoneAuth 
                ? mode === 'phone-verify' ? `Please enter the 6-digit authentication security PIN sent to +91 ${phone}.` : 'Register or sign in effortlessly code via SMS verification.'
                : mode === 'signin' ? 'Welcome back. Access custom prenatal sessions and specialist contact details.'
                : mode === 'signup' ? 'Welcome, Mother. Register your profile to securely schedule infant care.'
                : 'Enter your registered email below to receive a password reset link.'}
            </p>
          </div>
        </div>

        {/* Top-Level Navigation Tabs: Email vs Phone OTP */}
        <div className="flex border-b border-stone-100 bg-stone-50/50 p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => { 
              setIsPhoneAuth(false); 
              setMode('signin'); 
              setLocalError(null); 
              setLocalSuccess(null); 
            }}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              !isPhoneAuth 
                ? 'bg-emerald-800 text-stone-50 shadow-sm' 
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/45'
            }`}
          >
            Email Access
          </button>
          <button
            type="button"
            onClick={() => { 
              setIsPhoneAuth(true); 
              setMode('phone-start'); 
              setPhoneSubMode('signin');
              setLocalError(null); 
              setLocalSuccess(null); 
            }}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              isPhoneAuth 
                ? 'bg-emerald-800 text-stone-50 shadow-sm' 
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/45'
            }`}
          >
            Phone OTP Access
          </button>
        </div>

        {/* Sub-Tabs for Email (Sign In vs Sign Up) or Phone Start (Sign In vs Sign Up) */}
        {!isPhoneAuth && (mode === 'signin' || mode === 'signup') && (
          <div className="flex border-b border-stone-100 bg-stone-50/20 p-1.5 gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => { setMode('signin'); setLocalError(null); }}
              className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                mode === 'signin' 
                  ? 'bg-stone-100 text-stone-850 shadow-xs' 
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/30'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setLocalError(null); }}
              className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-stone-100 text-stone-850 shadow-xs' 
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/30'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {isPhoneAuth && mode === 'phone-start' && (
          <div className="flex border-b border-stone-100 bg-stone-50/20 p-1.5 gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => { setPhoneSubMode('signin'); setLocalError(null); }}
              className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                phoneSubMode === 'signin' 
                  ? 'bg-stone-100 text-stone-850 shadow-xs' 
                  : 'text-stone-500 hover:text-stone-750 hover:bg-stone-200/30'
              }`}
            >
              Sign In (OTP)
            </button>
            <button
              type="button"
              onClick={() => { setPhoneSubMode('signup'); setLocalError(null); }}
              className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                phoneSubMode === 'signup' 
                  ? 'bg-stone-100 text-stone-850 shadow-xs' 
                  : 'text-stone-500 hover:text-stone-750 hover:bg-stone-200/30'
              }`}
            >
              Register (OTP)
            </button>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3.5 scrollbar-thin">
          
          {/* Status Banners */}
          {(localError || firebaseError) && (
            <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-stone-800 text-xs flex items-start gap-2 shadow-xs">
              <AlertCircle className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-955 text-[11px] block">MaatriSparsh Alert</span>
                <p className="leading-normal text-[10.5px] text-stone-700 mt-0.5">{localError || firebaseError}</p>
              </div>
            </div>
          )}

          {localSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-stone-800 text-xs flex items-start gap-2 shadow-xs">
              <CheckCircle className="h-4 w-4 text-emerald-850 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950 text-[11px] block">Success</span>
                <p className="leading-normal text-[10.5px] text-stone-700 mt-0.5">{localSuccess}</p>
              </div>
            </div>
          )}

          {/* Quick Fill Button */}
          <div className="bg-amber-50/70 border border-amber-200 p-2 rounded-xl flex items-center justify-between gap-2.5 shadow-xs">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-stone-950">
                ⚡
              </span>
              <div className="text-left truncate">
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 block">Assessment Quick Fill</span>
                <p className="text-[10.5px] text-stone-600 truncate">
                  {!isPhoneAuth 
                    ? mode === 'signin' ? 'Demo Email Profile' : 'Random registration safe profile'
                    : phoneSubMode === 'signin' ? 'Generic Phone Login (+91 9999999999)' : 'Prefill phone sign up'
                  }
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[9.5px] font-bold uppercase tracking-wider text-amber-900 hover:text-white bg-amber-200 hover:bg-amber-600 px-2.5 py-1 rounded-md transition shrink-0 cursor-pointer"
            >
              Auto-Fill
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* EMAIL ACCESS INPUT FIELDS */}
            {!isPhoneAuth && (
              <>
                {mode === 'signup' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-stone-500 uppercase tracking-wider block">Mother's Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                        <input
                          type="text"
                          required
                          value={motherName}
                          onChange={(e) => setMotherName(e.target.value)}
                          placeholder="e.g. Aishwarya Roy"
                          className="w-full rounded-xl border border-stone-200 bg-stone-55/40 py-2 px-9 text-xs font-semibold focus:border-emerald-850 focus:outline-none focus:ring-1 focus:ring-emerald-850 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-stone-500 uppercase tracking-wider block">Contact Telephone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full rounded-xl border border-stone-200 bg-stone-55/40 py-2 px-9 text-xs font-semibold focus:border-emerald-850 focus:outline-none focus:ring-1 focus:ring-emerald-850 transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-stone-500 uppercase tracking-wider block">Email Coordinate *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. mother@maatrisparsh.com"
                      className="w-full rounded-xl border border-stone-200 bg-stone-55/40 py-2 px-9 text-xs font-semibold focus:border-emerald-850 focus:outline-none focus:ring-1 focus:ring-emerald-850 transition"
                    />
                  </div>
                </div>

                {(mode === 'signup' || mode === 'signin') && (
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-stone-500 uppercase tracking-wider block">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border border-stone-200 bg-stone-55/40 py-2 px-9 text-xs font-semibold focus:border-emerald-850 focus:outline-none focus:ring-1 focus:ring-emerald-850 transition"
                      />
                    </div>
                    {mode === 'signin' && (
                      <div className="text-right mt-1">
                        <button
                          type="button"
                          onClick={() => { setMode('forgot-password'); setLocalError(null); setLocalSuccess(null); }}
                          className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-stone-500 uppercase tracking-wider block">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Verify your secure password"
                        className="w-full rounded-xl border border-stone-200 bg-stone-55/40 py-2 px-9 text-xs font-semibold focus:border-emerald-850 focus:outline-none focus:ring-1 focus:ring-emerald-850 transition"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PHONE ACCESS INPUT FIELDS */}
            {isPhoneAuth && (
              <>
                {mode === 'phone-start' && (
                  <>
                    {phoneSubMode === 'signup' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-bold text-stone-500 uppercase tracking-wider block">Full Name *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                            <input
                              type="text"
                              required
                              value={motherName}
                              onChange={(e) => setMotherName(e.target.value)}
                              placeholder="e.g. Prerna Sharma"
                              className="w-full rounded-xl border border-stone-200 bg-stone-50/40 py-2 px-9 text-xs font-semibold focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9.5px] font-bold text-stone-500 uppercase tracking-wider block">Email Address (Optional)</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. prerna@gmail.com"
                              className="w-full rounded-xl border border-stone-200 bg-stone-50/40 py-2 px-9 text-xs font-semibold focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-stone-500 uppercase tracking-wider block">Indian Mobile Number *</label>
                      <div className="flex gap-2">
                        <span className="bg-stone-100 text-stone-700 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold flex items-center justify-center shrink-0">
                          🇮🇳 +91
                        </span>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/40 py-2 px-9 text-xs font-semibold focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {mode === 'phone-verify' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-stone-600 block text-center uppercase tracking-wider">
                      OTP Security Pin (6 Digits)
                    </label>
                    
                    {/* Separate OTP Inputs */}
                    <div className="flex justify-center gap-2 py-3" id="otp-container">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-12 text-center text-lg font-black border border-stone-250 bg-stone-50/80 rounded-xl focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100 text-stone-900 transition focus:outline-none shadow-sm"
                        />
                      ))}
                    </div>

                    {/* Resend button & timer */}
                    <div className="flex items-center justify-between text-[11px] px-1 pt-1 text-stone-520 font-bold">
                      {timer > 0 ? (
                        <span>Resend OTP in <span className="text-emerald-700 font-black">{timer}s</span></span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-emerald-800 hover:underline hover:text-emerald-900 focus:outline-none cursor-pointer"
                        >
                          Send verification code again
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => { setMode('phone-start'); setLocalError(null); }}
                        className="text-stone-500 hover:text-stone-700 hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-800 hover:bg-emerald-900 text-stone-0 py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2.5 block shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
            >
              {loading 
                ? 'Processing...' 
                : isPhoneAuth 
                  ? mode === 'phone-start' ? 'Send Verification OTP' : 'Verify Security OTP'
                  : mode === 'signin' ? 'Sign In to MaatriSparsh' 
                  : mode === 'signup' ? 'Register Care Profile'
                  : 'Send Reset Link'
              }
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative my-2.5 flex py-1 items-center">
            <div className="flex-grow border-t border-stone-150"></div>
            <span className="flex-shrink mx-2.5 text-[9.5px] text-stone-400 font-mono uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-stone-150"></div>
          </div>

          <div className="space-y-2">
            {/* Google Identity Sso */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full rounded-full border border-stone-250 hover:bg-stone-50 bg-white py-2 text-xs font-bold text-stone-700 transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs hover:border-stone-450"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.123C18.232 1.91 15.44.975 12.24.975c-6.082 0-11 4.918-11 11s4.918 11 11 11c6.35 0 10.511-4.434 10.511-10.61 0-.713-.075-1.258-.172-1.78l-10.34-.002z"
                />
              </svg>
              <span>Google Verification</span>
            </button>
          </div>

          {/* Mode Switcher footer text */}
          <div className="text-center pt-0.5">
            {!isPhoneAuth ? (
              mode === 'signin' ? (
                <span className="text-[11px] text-stone-500 font-semibold">
                  First time with MaatriSparsh?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setLocalError(null); }}
                    className="text-emerald-800 hover:underline font-bold cursor-pointer"
                  >
                    Create account
                  </button>
                </span>
              ) : mode === 'signup' ? (
                <span className="text-[11px] text-stone-500 font-semibold">
                  Already registered to MaatriSparsh?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setLocalError(null); }}
                    className="text-emerald-800 hover:underline font-bold cursor-pointer"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span className="text-[11px] text-stone-500 font-semibold">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setLocalError(null); }}
                    className="text-emerald-800 hover:underline font-bold cursor-pointer flex items-center justify-center space-x-1 mx-auto"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back to Sign In</span>
                  </button>
                </span>
              )
            ) : (
              mode === 'phone-verify' ? (
                <button
                  type="button"
                  onClick={() => { setMode('phone-start'); setLocalError(null); }}
                  className="text-[11px] text-emerald-800 hover:underline font-semibold flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back to phone number entry</span>
                </button>
              ) : null
            )}
          </div>

          {/* Security lock badge */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center space-x-1.5 text-[9.5px] text-stone-400 shrink-0 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            <span>MaatriSparsh utilizes HIPAA-aligned storage safeguards.</span>
          </div>

          <div id="recaptcha-verifier" className="hidden"></div>
        </div>
      </div>
    </div>
  );
}
