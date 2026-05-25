import { useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { X, Calendar, User, Clock, Check, RefreshCw, XCircle, FileText, Heart, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyBookingsModalProps {
  onClose: () => void;
}

export default function MyBookingsModal({ onClose }: MyBookingsModalProps) {
  const { bookings, cancelBookingInFirestore, userProfile } = useFirebase();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCancelClick = async (bookingId: string) => {
    setLocalError(null);
    setCancellingId(bookingId);
  };

  const handleConfirmCancel = async (bookingId: string) => {
    setActionLoading(true);
    try {
      await cancelBookingInFirestore(bookingId);
      setCancellingId(null);
    } catch (err: any) {
      console.error(err);
      setLocalError('Failed to cancel the booking. It might be locked or forbidden.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-905/60 bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4" id="my-bookings-modal-container">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-105 bg-stone-50">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-850 text-white">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 leading-none">
                MaatriSparsh Care Dashboard
              </h3>
              <p className="text-[10px] text-stone-500 font-mono tracking-wide uppercase mt-1">
                Real-Time Care Slots for {userProfile?.motherName || 'Verified Member'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-200/50 hover:text-stone-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {localError && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-stone-800 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-700 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4" id="bookings-empty-state">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="font-serif text-sm font-bold text-stone-800">No Scheduled Treatments Found</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  You haven't booked any Sutika postpartum or pediatric baby wellness consults with MaatriSparsh yet. Complete your profile and schedule your first session.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5" id="bookings-catalog-list">
              {bookings.map((booking) => {
                const isCancelled = booking.status === 'cancelled';
                const isItemCancelling = cancellingId === booking.id;

                return (
                  <div
                    key={booking.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCancelled 
                        ? 'bg-stone-50/70 border-stone-200/60 opacity-75' 
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      {/* Session Identity & Timing metadata */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            isCancelled 
                              ? 'bg-stone-200 text-stone-605' 
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          }`}>
                            {booking.status}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono uppercase">Ref: {booking.id}</span>
                        </div>

                        <h4 className="font-serif text-sm sm:text-base font-bold text-stone-900 leading-tight">
                          {booking.service.name}
                        </h4>
                        
                        <div className="flex items-center gap-2 text-xs text-stone-650 font-medium">
                          <Clock className="h-3.5 w-3.5 text-stone-400" />
                          <span>Appointment Hour: {booking.date} @ <strong>{booking.timeSlot}</strong></span>
                        </div>

                        {/* Optional Baby Information info block */}
                        {(booking.userDetails.babyName || booking.userDetails.notes) && (
                          <div className="bg-stone-50/50 rounded-xl p-2.5 text-[11px] border border-stone-100/50 mt-2 space-y-1 text-stone-600 leading-relaxed">
                            {booking.userDetails.babyName && (
                              <div>👶 Infant Registered: <strong>{booking.userDetails.babyName}</strong> ({booking.userDetails.babyAgeWeeks || 'Postpartum'} weeks old)</div>
                            )}
                            {booking.userDetails.notes && (
                              <div className="italic text-stone-550 line-clamp-2">" {booking.userDetails.notes} "</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Pricing and Action Cancel panel */}
                      <div className="flex sm:flex-col justify-between items-end shrink-0 pt-1">
                        <div className="text-right">
                          <span className="block text-[9px] text-stone-400 font-mono uppercase tracking-wider leading-none">Consultation Fee</span>
                          <span className="font-serif font-black text-sm sm:text-base text-emerald-850">${booking.service.price}</span>
                        </div>

                        {!isCancelled && (
                          <div className="mt-3">
                            <AnimatePresence mode="wait">
                              {isItemCancelling ? (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="flex items-center space-x-1.5"
                                >
                                  <button
                                    onClick={() => handleConfirmCancel(booking.id)}
                                    disabled={actionLoading}
                                    className="bg-rose-700 hover:bg-rose-800 text-stone-50 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition"
                                  >
                                    Confirm Cancel
                                  </button>
                                  <button
                                    onClick={() => setCancellingId(null)}
                                    className="border border-stone-300 text-stone-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition hover:bg-stone-50"
                                  >
                                    Dismiss
                                  </button>
                                </motion.div>
                              ) : (
                                <button
                                  onClick={() => handleCancelClick(booking.id)}
                                  className="text-stone-450 hover:text-rose-750 text-xs font-semibold py-1 hover:underline transition cursor-pointer flex items-center space-x-1.5"
                                >
                                  <XCircle className="h-4 w-4 shrink-0" />
                                  <span>Cancel Slot</span>
                                </button>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-105 px-6 py-4 flex justify-between items-center text-xs text-stone-500">
          <div className="flex items-center space-x-1">
            <Heart className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
            <span>MaatriSparsh Pediatric Liason will call if schedules adjust.</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
