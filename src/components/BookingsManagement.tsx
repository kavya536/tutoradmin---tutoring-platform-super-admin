import * as React from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  BookOpen,
  X,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, Tabs, Table, Modal } from './UI';
import { Booking, Student } from '../types';
import { doc, updateDoc, serverTimestamp, getDoc, increment, query, collection, where, getDocs, addDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

interface BookingsManagementProps {
  bookings: Booking[];
  onUpdateStatus?: (id: string, status: string) => void;
}

// Centralized Subject Master System
const SUBJECT_MASTER: Record<string, { name: string, aliases: string[] }> = {
  'mathematics': {
    name: 'Mathematics',
    aliases: ['maths', 'math', 'mathemathics', 'calculus', 'algebra', 'maths 1a', 'maths 1b', 'maths 2a', 'maths 2b', 'discrete mathematics', 'mathematics (b.tech/b.sc)']
  },
  'physics': {
    name: 'Physics',
    aliases: ['phisics', 'phys']
  },
  'chemistry': {
    name: 'Chemistry',
    aliases: ['chemestry', 'chem']
  },
  'biology': {
    name: 'Biology',
    aliases: ['bio', 'biological sciences']
  },
  'computer_science': {
    name: 'Computer Science',
    aliases: ['cs', 'computer', 'programming', 'it', 'java', 'python', 'c programming', 'html/css', 'javascript', 'react.js', 'node.js', 'sql/mysql', 'postgresql', 'artificial intelligence', 'machine learning']
  },
  'english': {
    name: 'English',
    aliases: ['english language', 'literature']
  },
  'social_studies': {
    name: 'Social Studies',
    aliases: ['sst', 'social science', 'history', 'geography', 'civics']
  },
  'hindi': {
    name: 'Hindi',
    aliases: []
  },
  'sanskrit': {
    name: 'Sanskrit',
    aliases: []
  },
  'telugu': {
    name: 'Telugu',
    aliases: []
  },
  'business_studies': {
    name: 'Business Studies',
    aliases: ['business', 'bst']
  },
  'accountancy': {
    name: 'Accountancy',
    aliases: ['accounts', 'accounting']
  },
  'economics': {
    name: 'Economics',
    aliases: ['eco']
  },
  'science': {
    name: 'Science',
    aliases: ['general science']
  },
  'evs': {
    name: 'EVS',
    aliases: ['environmental science']
  }
};

const getSubjectName = (id: string): string => {
  if (!id || typeof id !== 'string') return 'General Session';
  const normalized = id.toLowerCase();
  return SUBJECT_MASTER[normalized]?.name || id.charAt(0).toUpperCase() + id.slice(1);
};

export const BookingsManagement = ({ bookings }: BookingsManagementProps) => {
  const [activeTab, setActiveTab] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [showRejectionForm, setShowRejectionForm] = React.useState(false);

  const filteredBookings = bookings.filter(b => {
    let matchesTab = true;
    if (activeTab !== 'All') {
      matchesTab = b.status === activeTab.toLowerCase();
    }
    
    const matchesSearch = b.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.tutorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = ['All', 'Pending', 'Confirmed', 'Cancelled'];

  const calculateRefund = (booking: Booking, student?: Student) => {
    if (!booking.amount) return { eligible: false, refundAmount: 0, reason: "No payment found" };

    const totalPaidAmount = booking.amount;
    
    // Get tier - prioritize tierAtBooking if saved, else fallback to student subscription tier
    const tier = (booking as any).tierAtBooking || 
                 student?.subscription?.tier || 
                 ((booking as any).plan?.toLowerCase().includes('premium') ? 'premium' : 
                  (booking as any).plan?.toLowerCase().includes('standard') ? 'standard' : 'free');
    
    // Get plan dates - fallback to enrollment dates or registration
    const startDate = student?.subscription?.startDate?.toDate ? student.subscription.startDate.toDate() : (student?.subscription?.startDate ? new Date(student.subscription.startDate) : (booking as any).paidAt?.toDate ? (booking as any).paidAt.toDate() : (booking.paidAt ? new Date(booking.paidAt) : null));
    const endDate = student?.subscription?.expiresAt?.toDate ? student.subscription.expiresAt.toDate() : (student?.subscription?.expiresAt ? new Date(student.subscription.expiresAt) : null);
    
    if (!startDate || !endDate) return { eligible: false, refundAmount: 0, reason: "Plan duration unknown" };

    const now = new Date();
    const totalDurationMs = endDate.getTime() - startDate.getTime();
    const totalDurationDays = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24)) || 30;
    
    const timeSinceStartMs = now.getTime() - startDate.getTime();
    const daysSinceStart = Math.ceil(timeSinceStartMs / (1000 * 60 * 60 * 24));
    
    const timeUntilEndMs = endDate.getTime() - now.getTime();
    const daysUntilEnd = Math.ceil(timeUntilEndMs / (1000 * 60 * 60 * 24));

    const attendedClasses = (booking as any).attendedCount || 0;

    // 1. Last 10 Days Rule
    if (daysUntilEnd <= 10) {
      return { 
        eligible: false, 
        refundAmount: 0, 
        reason: "No refund in last 10 days",
        details: `Plan ends in ${daysUntilEnd} days.`
      };
    }

    // 2. Initial 3-day/3-class window
    if (daysSinceStart <= 3 && attendedClasses <= 3) {
      const dailyRate = totalPaidAmount / totalDurationDays;
      const attendedCharges = dailyRate * Math.max(daysSinceStart, attendedClasses);
      const platformFee = totalPaidAmount * 0.04;
      const refundAmount = totalPaidAmount - attendedCharges - platformFee;
      
      return { 
        eligible: refundAmount > 0, 
        refundAmount: Math.max(0, Math.floor(refundAmount)), 
        reason: "Initial 3-day Window Refund",
        details: "Deductions: Attended classes + 4% platform fee.",
        breakdown: {
          totalPaidAmount,
          attendedCharges: Math.floor(attendedCharges),
          platformFee: Math.floor(platformFee),
          daysSinceStart,
          attendedClasses
        }
      };
    }

    // 3. After 3 days, before last 10 days
    if (tier === 'free') {
      return { eligible: false, refundAmount: 0, reason: "Free Plan: Non-refundable" };
    }

    const refundPercent = tier === 'premium' ? 0.40 : 0.20;
    const refundAmount = totalPaidAmount * refundPercent;

    return {
      eligible: true,
      refundAmount: Math.floor(refundAmount),
      reason: `${tier.toUpperCase()} Plan: Partial Refund`,
      details: `${refundPercent * 100}% of total amount. Deductions applied.`,
      breakdown: {
        totalPaidAmount,
        refundPercent: refundPercent * 100,
        daysSinceStart,
        daysUntilEnd
      }
    };
  };






  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsProcessing(true);
    try {
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, { 
        status: newStatus,
        adminResolutionAt: serverTimestamp()
      });
      setSelectedBooking(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setIsProcessing(false);
    }
  };




  const handleMarkRefundPaid = async (id: string) => {
    setIsProcessing(true);
    try {
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, {
        refundStatus: 'completed',
        refundPaidAt: serverTimestamp(),
        transactionLedger: arrayUnion({
          amount: 0,
          type: 'manual_refund_paid',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          status: 'completed'
        })
      });
      setSelectedBooking(null);
    } catch (err) {
      console.error("Failed to mark refund as paid:", err);
      alert("Failed to update refund status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3, ease: 'easeOut' as const }
    },
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Bookings Management

          </h2>
          <p className="text-gray-500 font-medium">Monitor tutoring sessions and handle booking updates.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-transparent rounded-xl text-sm focus:bg-gray-50 focus:ring-4 focus:ring-primary/5 outline-none transition-all w-full md:w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
        </div>
      </motion.div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <Card className="border-none shadow-xl shadow-gray-100/50">
        <Table headers={['Student', 'Tutor', 'Subject', 'Date & Time', 'Booked On', 'Status']}>
          <AnimatePresence mode="popLayout">
            {filteredBookings.map((booking) => (
              <motion.tr 
                key={booking.id} 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                layout
                onClick={() => setSelectedBooking(booking)}
                className="hover:bg-gray-50/80 transition-all group cursor-pointer border-b border-gray-100 last:border-0"
              >
              <td className="px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform font-bold">
                    {booking.studentName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-black text-gray-900 block">{booking.studentName}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{booking.studentType || 'Student'}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform font-bold text-xs">
                    {(booking.tutorName || 'T').charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{booking.tutorName}</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gray-50 rounded-lg">
                    <BookOpen size={14} className="text-gray-400" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{getSubjectName(booking.subject)}</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <Calendar size={12} className="text-primary" />
                    {(booking.dateTime || booking.date || '').split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                    <Clock size={12} />
                    {booking.dateTime ? booking.dateTime.split(' ')[1] : (booking.time || '')}
                  </span>
                  <div className="mt-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter ${booking.studentType === 'demo' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {booking.studentType === 'demo' ? 'Demo Class' : 'Regular Course'}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 text-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {(booking as any).createdAt ? ((booking as any).createdAt.toDate ? (booking as any).createdAt.toDate().toLocaleString() : new Date((booking as any).createdAt).toLocaleString()) : 'N/A'}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <Badge 
                  variant={
                    booking.status === 'confirmed' ? 'success' : 
                    booking.status === 'pending' ? 'warning' : 
                    ['approved_cancellation', 'refund_completed'].includes(booking.status) ? 'success' :
                    'danger'
                  }
                >
                  {booking.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </td>
            </motion.tr>
          ))}
          </AnimatePresence>
        </Table>

        {filteredBookings.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Calendar size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900">No bookings found</h3>
            <p className="text-gray-400 font-medium">Try adjusting your filters or search query.</p>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedBooking} 
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
      >
        {selectedBooking && (
          <div className="space-y-8 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Student Info</p>
                <p className="text-sm font-black text-gray-900">{selectedBooking.studentName}</p>
                <p className="text-xs text-gray-500 font-bold mt-1">{selectedBooking.studentEmail || 'No email'}</p>
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tutor Info</p>
                <p className="text-sm font-black text-gray-900">{selectedBooking.tutorName}</p>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">ID: {selectedBooking.tutorId.substring(0,8)}...</p>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900">{selectedBooking.subject}</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Active Enrollment</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-900">₹{selectedBooking.amount || 0}</p>
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Total Price</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-6 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-primary/40" />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Scheduled Date</p>
                    <p className="text-sm font-bold text-gray-700">{selectedBooking.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-primary/40" />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Session Time</p>
                    <p className="text-sm font-bold text-gray-700">{selectedBooking.time}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {['pending_cancellation', 'approved_cancellation', 'refund_completed'].includes(selectedBooking.status) && (
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-rose-500" size={18} />
                  <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Cancellation Request Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-rose-400 uppercase">Reason for Cancellation</p>
                    <p className="text-xs font-bold text-rose-900 leading-relaxed bg-white/50 p-3 rounded-xl border border-rose-100">
                      {selectedBooking.cancellationReason || 'No reason provided'}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Student Preference</p>
                      <Badge variant={selectedBooking.bookedAnotherTutor ? 'success' : 'default'} className="text-[9px]">
                        {selectedBooking.bookedAnotherTutor ? 'Wants Another Tutor' : 'No New Tutor'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Refund Preference</p>
                      <Badge variant={selectedBooking.wantsRefund ? 'warning' : 'default'} className="text-[9px]">
                        {selectedBooking.wantsRefund ? 'Requested Refund' : 'No Refund Req'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* General Actions for other statuses */}
              <div className="flex flex-col gap-3 pt-4">
                {selectedBooking.status === 'cancelled' && selectedBooking.refundStatus !== 'completed' && (
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/10"
                    onClick={() => handleMarkRefundPaid(selectedBooking.id)}
                    disabled={isProcessing}
                  >
                    <CheckCircle2 size={16} className="mr-2" /> Mark Manual Refund as Paid (UPI)
                  </Button>
                )}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 py-4 rounded-xl font-bold"
                    onClick={() => handleUpdateStatus(selectedBooking.id, selectedBooking.status === 'cancelled' ? 'confirmed' : 'cancelled')}
                    disabled={isProcessing}
                  >
                    {selectedBooking.status === 'cancelled' ? 'Restore Booking' : 'Manual Cancel'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="px-6 rounded-xl font-bold"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>

          </div>
        )}
      </Modal>
    </div>
  );
};
