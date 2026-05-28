import React, { useState, FormEvent } from 'react';
import { useFirebase } from './FirebaseProvider';
import { X, Mail, Lock, User, Phone, Heart, AlertCircle, CheckCircle, ShieldCheck, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

type AuthMode = 'signin' | 'signup' | 'forgot-password';

export default function AuthModal({ onClose, onSuccess, initialMode = 'signin' }: AuthModalProps) {
  const { signUpWithEmail, signInWithEmail, signInWithGoogle, sendPasswordReset, error: firebaseError } = useFirebase();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [motherName, setMotherName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Component level states
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);
    setLoading(true);

    try {
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
    } catch (err: any) {
      console.error(err);
      setLocalError(err?.message || 'Verification or profile registration failed.');
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
              {mode === 'signin' ? 'Sign In' 
                : mode === 'signup' ? 'Create Account' 
                : 'Reset Password'}
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
              {mode === 'signin' ? 'Welcome back. Access custom prenatal sessions and specialist contact details.'
                : mode === 'signup' ? 'Welcome, Mother. Register your profile to securely schedule infant care.'
                : 'Enter your registered email below to receive a password reset link.'}
            </p>
          </div>
        </div>

        {/* Sub-Tabs for Email (Sign In vs Sign Up) */}
        {(mode === 'signin' || mode === 'signup') && (
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



          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-800 hover:bg-emerald-900 text-stone-0 py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2.5 block shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
            >
              {loading 
                ? 'Processing...' 
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
            {mode === 'signin' ? (
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
            )}
          </div>

          {/* Security lock badge */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center space-x-1.5 text-[9.5px] text-stone-400 shrink-0 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            <span>MaatriSparsh utilizes HIPAA-aligned storage safeguards.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
