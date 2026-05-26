import { useState, useMemo } from 'react';
import { useFirebase } from './FirebaseProvider';
import { X, Calendar, User, Clock, FileText, Heart, ShieldAlert, Check, Edit2, CheckCircle2, MessageSquare, Mail, Users, Smartphone } from 'lucide-react';
import { Booking } from '../types';

interface AdminPortalModalProps {
  onClose: () => void;
  onOpenBookingWizard: () => void;
}

export default function AdminPortalModal({ onClose, onOpenBookingWizard }: AdminPortalModalProps) {
  const { bookings, cancelBookingInFirestore, editBookingInFirestore, activityLogs, allUsersList } = useFirebase();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab ] = useState<'bookings' | 'logs' | 'users'>('bookings');

  // Inline Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBabyName, setEditBabyName] = useState('');
  const [editBabyAgeWeeks, setEditBabyAgeWeeks] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleStartEdit = (booking: Booking) => {
    setEditingId(booking.id);
    setEditName(booking.userDetails?.motherName || booking.customerName || '');
    setEditPhone(booking.userDetails?.phone || booking.phone || '');
    setEditEmail(booking.userDetails?.email || booking.email || '');
    setEditBabyName(booking.userDetails?.babyName || '');
    setEditBabyAgeWeeks(booking.userDetails?.babyAgeWeeks || '');
    setEditNotes(booking.userDetails?.notes || booking.notes || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (bookingId: string) => {
    setActionLoading(true);
    setLocalError(null);
    try {
      await editBookingInFirestore(bookingId, {
        customerName: editName,
        phone: editPhone,
        email: editEmail,
        userDetails: {
          motherName: editName,
          phone: editPhone,
          email: editEmail,
          babyName: editBabyName || undefined,
          babyAgeWeeks: editBabyAgeWeeks || undefined,
          notes: editNotes || undefined
        }
      });
      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      setLocalError('Failed to save Client Profile parameters.');
    } finally {
      setActionLoading(false);
    }
  };

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
      setLocalError('Failed to update the booking.');
    } finally {
      setActionLoading(false);
    }
  };

  // Safe mapping and sorting
  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-rose-100 bg-rose-50">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-800 text-white">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 leading-none">
                Admin Control Room
              </h3>
              <p className="text-[10px] text-stone-600 font-mono tracking-wide uppercase mt-1">
                Active Schedule Records Management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenBookingWizard}
              className="bg-rose-800 hover:bg-rose-900 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm"
            >
              + Create Booking
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-100 bg-stone-50">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-white border-b-2 border-rose-800 text-rose-900'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
            }`}
          >
            Active Bookings ({sortedBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white border-b-2 border-rose-800 text-rose-900'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
            }`}
          >
            Registered Mothers ({allUsersList?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white border-b-2 border-rose-800 text-rose-900'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
            }`}
          >
            Live Activity Logs ({activityLogs.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50">
          
          {localError && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-stone-805 text-xs flex items-center gap-2 mb-4">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-700 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          {activeTab === 'bookings' && (
            sortedBookings.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                  <Calendar className="h-7 w-7" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h4 className="font-serif text-sm font-bold text-stone-800">No Bookings Yet</h4>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedBookings.map((booking) => {
                  const isCancelled = booking.status === 'Cancelled' || booking.status === 'cancelled';
                  const isItemCancelling = cancellingId === booking.id;
                  const isEditing = editingId === booking.id;

                  return (
                    <div
                      key={booking.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCancelled 
                          ? 'bg-stone-100/50 border-stone-200 opacity-70' 
                          : 'bg-white border-stone-200 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
                              isCancelled ? 'bg-stone-200 text-stone-600' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {booking.status}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              ID: {booking.id.split('-')[0]}
                            </span>
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-stone-900 text-sm">
                              {booking.service.name}
                            </h4>

                            {isEditing ? (
                              <div className="mt-3 p-4 bg-rose-50/40 rounded-2xl border border-rose-100/80 space-y-3 text-xs">
                                <span className="font-serif font-bold text-rose-900 block border-b border-rose-100/50 pb-1">Edit Client Profile</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Mother's Name Required</label>
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-800"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">WhatsApp / Phone Number</label>
                                    <input
                                      type="text"
                                      value={editPhone}
                                      onChange={(e) => setEditPhone(e.target.value)}
                                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-800"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Email coordinates</label>
                                    <input
                                      type="email"
                                      value={editEmail}
                                      onChange={(e) => setEditEmail(e.target.value)}
                                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-800"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Baby’s Name</label>
                                    <input
                                      type="text"
                                      value={editBabyName}
                                      onChange={(e) => setEditBabyName(e.target.value)}
                                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-800"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Baby’s Age (weeks)</label>
                                    <input
                                      type="text"
                                      value={editBabyAgeWeeks}
                                      onChange={(e) => setEditBabyAgeWeeks(e.target.value)}
                                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-800"
                                    />
                                  </div>
                                  <div className="space-y-1 sm:col-span-2">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Physical care advisory notes</label>
                                    <textarea
                                      rows={2}
                                      value={editNotes}
                                      onChange={(e) => setEditNotes(e.target.value)}
                                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-800"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={actionLoading}
                                    className="bg-white border border-stone-300 text-stone-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-stone-100 transition cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(booking.id)}
                                    disabled={actionLoading}
                                    className="bg-rose-800 text-white px-3.5 py-1.5 rounded-lg font-bold hover:bg-rose-900 transition cursor-pointer"
                                  >
                                    {actionLoading ? 'Saving...' : 'Save Updates'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                                <div className="flex items-center text-stone-600 gap-1.5 font-medium">
                                  <User className="h-3.5 w-3.5 text-stone-400" />
                                  <span>Client: <strong>{booking.userDetails?.motherName || booking.customerName}</strong> ({booking.userDetails?.phone || booking.phone})</span>
                                </div>
                                <div className="flex items-center text-stone-600 gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-stone-400" />
                                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-stone-600 gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-stone-400" />
                                  <span>{booking.timeSlot}</span>
                                </div>
                                <div className="flex items-center text-stone-600 gap-1.5 col-span-full">
                                  <FileText className="h-3.5 w-3.5 text-stone-400" />
                                  <span className="truncate">Email Alerts: {booking.userDetails?.email || booking.email}</span>
                                </div>
                                {(booking.userDetails?.babyName || booking.userDetails?.deliveryType || booking.userDetails?.address || booking.userDetails?.focusArea || booking.userDetails?.notes) && (
                                  <div className="col-span-full bg-stone-50 border border-stone-150 rounded-xl p-3 mt-2 leading-relaxed space-y-1.5 min-w-[280px]">
                                    {booking.userDetails?.babyName && (
                                      <div className="text-stone-800">
                                        👶 <span className="font-semibold text-stone-700">Registered Infant:</span> <strong>{booking.userDetails.babyName}</strong> {booking.userDetails.babyAgeWeeks ? `(${booking.userDetails.babyAgeWeeks} weeks old)` : ''}
                                      </div>
                                    )}

                                    {booking.userDetails?.deliveryType && (
                                      <div className="text-stone-800 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                        <span className="bg-amber-100/60 text-amber-955 font-semibold px-2 py-0.5 rounded border border-amber-200">
                                          🤰 {booking.userDetails.deliveryType === 'normal' ? 'Normal / Vaginal Delivery' : 'Cesarean / C-Section (LSCS)'}
                                        </span>
                                        {booking.userDetails.deliveryDate && (
                                          <span className="text-stone-500 font-mono self-center">
                                            📅 Date: {booking.userDetails.deliveryDate}
                                          </span>
                                        )}
                                        {booking.userDetails.stitchCondition && (
                                          <span className="text-[#a16207] self-center">
                                            🧵 Stitches: {booking.userDetails.stitchCondition}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {booking.userDetails?.address && (
                                      <div className="text-stone-700 bg-white border border-stone-200/65 p-2.5 rounded-lg mt-1 text-xs">
                                        📍 <span className="font-semibold text-emerald-900">Home Visit Address (Raipur-Bhilai-Durg Area):</span>
                                        <p className="font-semibold text-stone-900 mt-0.5">{booking.userDetails.address}, {booking.userDetails.city || 'Raipur'} {booking.userDetails.pincode ? `- ${booking.userDetails.pincode}` : ''}</p>
                                      </div>
                                    )}

                                    {booking.userDetails?.focusArea && (
                                      <div className="text-stone-800">
                                        🎯 <span className="font-semibold text-stone-700">Consultation Focus:</span> <span className="bg-emerald-50 text-emerald-800 font-mono text-[10px] px-1.5 py-0.5 rounded border border-emerald-100">{booking.userDetails.focusArea}</span>
                                      </div>
                                    )}

                                    {booking.userDetails?.notes && (
                                      <p className="italic text-stone-500 border-t border-stone-100 pt-1.5 mt-1 text-[11px]">" {booking.userDetails.notes} "</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end justify-between self-stretch border-t sm:border-t-0 sm:border-l border-stone-100 pt-3 sm:pt-0 sm:pl-4 pl-0">
                          <div className="text-right">
                            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-mono mb-1">Fee</div>
                            <div className="font-mono font-bold text-emerald-800">
                              ₹{booking.service.price || booking.priceInr}
                            </div>
                          </div>
                          
                          {!isCancelled && !isEditing && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleStartEdit(booking)}
                                className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-700 bg-stone-50/50 hover:bg-stone-50 transition cursor-pointer flex items-center space-x-1"
                              >
                                <Edit2 className="h-3 w-3 text-stone-500" />
                                <span>Edit Client</span>
                              </button>

                              {isItemCancelling ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setCancellingId(null)}
                                    disabled={actionLoading}
                                    className="text-[11px] px-2 py-1 rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 transition"
                                  >
                                    Back
                                  </button>
                                  <button
                                    onClick={() => handleConfirmCancel(booking.id)}
                                    disabled={actionLoading}
                                    className="text-[11px] px-2 py-1 rounded-md bg-stone-900 text-white hover:bg-black transition"
                                  >
                                    Confirm
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCancelClick(booking.id)}
                                  className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-rose-800 hover:bg-rose-50 transition cursor-pointer"
                                >
                                  Cancel Slot
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/50 border border-emerald-200/40 p-4 rounded-xl text-xs text-stone-750 flex items-start gap-2.5">
                <Users className="h-5 w-5 text-emerald-800 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-emerald-950 font-serif block text-sm">Mother Sanctum Directory ({allUsersList?.length || 0})</strong>
                  <p className="mt-0.5 leading-relaxed text-stone-650">The historical registration catalog of all postnatal mothers and users signed up to MaatriSparsh. Real-time profiles with direct WhatsApp coordination indicators are presented below.</p>
                </div>
              </div>

              {(!allUsersList || allUsersList.length === 0) ? (
                <div className="text-center py-12 px-4 space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                    <User className="h-7 w-7" />
                  </div>
                  <p className="text-xs text-stone-500 font-mono">No registered users found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allUsersList.map((usr: any) => {
                    const isUserAdmin = usr.role === 'admin' || usr.email?.toLowerCase() === 'maatrisparsh@gmail.com' || usr.email?.toLowerCase() === 'spaar161.pk@gmail.com';
                    return (
                      <div 
                        key={usr.uid} 
                        className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-emerald-500 transition-all group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-950 flex items-center justify-center font-bold font-serif text-sm border border-emerald-100 uppercase">
                                {usr.motherName ? usr.motherName.substring(0, 2) : 'MS'}
                              </div>
                              <div>
                                <h4 className="font-serif font-black text-stone-900 text-sm leading-tight flex flex-wrap items-center gap-1.5">
                                  {usr.motherName || usr.fullName}
                                  {isUserAdmin && (
                                    <span className="text-[9px] font-mono tracking-wider font-extrabold uppercase bg-rose-50 text-rose-800 border border-rose-100 px-1 py-0.5 rounded">
                                      Admin
                                    </span>
                                  )}
                                </h4>
                                <span className="text-[9px] text-stone-400 font-mono block mt-0.5">UID: {usr.uid.substring(0, 10)}...</span>
                              </div>
                            </div>
                            
                            <span className={`text-[10px] px-2 py-0.5 rounded-xs font-bold flex items-center gap-1 ${
                              usr.isVerified 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                                : 'bg-amber-50 text-amber-800 border border-amber-100'
                            }`}>
                              <CheckCircle2 className="h-3 w-3" />
                              {usr.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </div>

                          <div className="space-y-1.5 border-t border-stone-100 pt-2.5 text-xs text-stone-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                              <a href={`mailto:${usr.email}`} className="hover:text-emerald-900 hover:underline transition truncate">
                                {usr.email}
                              </a>
                            </div>
                            
                            {usr.phone && (
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                <a href={`https://wa.me/${usr.phone.replace(/\+/g, '').replace(/\s+/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-emerald-900 font-mono transition flex items-center gap-1">
                                  {usr.phone}
                                  <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-[1px] rounded font-sans scale-90 border border-emerald-100">WhatsApp 💬</span>
                                </a>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-50 text-[10px] text-stone-400 font-mono">
                              <div>
                                <span className="block text-stone-300 text-[8px] uppercase tracking-wider">Signed Up</span>
                                <span>{usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-stone-300 text-[8px] uppercase tracking-wider">Last Login</span>
                                <span>{usr.lastLogin ? new Date(usr.lastLogin).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            /* System Activity logs showing live email and SMS confirmation triggers */
            <div className="space-y-3.5">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-stone-700 space-y-1">
                <strong className="text-stone-900 font-serif block">Automated Dispatch Audit logs</strong>
                <p>This panel shows all live actions. Entries tagged with <strong>SEND_CONFIRMATION</strong> verify that the system has successfully triggered and dispatched Email alerts and SMS receipts to the respective client's credentials.</p>
              </div>

              {activityLogs.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs font-mono">
                  No system logs recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activityLogs.map((log) => {
                    const isConfirmation = log.action === 'SEND_CONFIRMATION';
                    return (
                      <div
                        key={log.id}
                        className={`p-3.5 rounded-xl border text-xs font-mono transition-all ${
                          isConfirmation
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-white border-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-light-200 pb-1.5 mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            isConfirmation ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-stone-750 font-sans leading-relaxed text-xs">
                          {log.details}
                        </p>
                        
                        {isConfirmation && (
                          <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center gap-4 text-[10px] text-emerald-800 font-sans font-semibold">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Email: Latching post-natal details dispatched</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5 text-emerald-700" />
                              <span>SMS: WhatsApp transaction code transmitted</span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
