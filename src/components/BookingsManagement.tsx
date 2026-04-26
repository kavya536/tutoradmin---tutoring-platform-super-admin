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
import { Booking } from '../types';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface BookingsManagementProps {
  bookings: Booking[];
  onUpdateStatus?: (id: string, status: string) => void;
}

export const BookingsManagement = ({ bookings }: BookingsManagementProps) => {
  const [activeTab, setActiveTab] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const filteredBookings = bookings.filter(b => {
    let matchesTab = true;
    if (activeTab === 'Cancellations') {
      matchesTab = b.status === 'pending_cancellation';
    } else if (activeTab !== 'All') {
      matchesTab = b.status === activeTab.toLowerCase();
    }
    
    const matchesSearch = b.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.tutorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = ['All', 'Pending', 'Confirmed', 'Cancelled', 'Cancellations'];

  const calculateRefund = (booking: Booking) => {
    if (!booking.amount) return { eligible: false, refundAmount: 0 };
    const platformFeeRate = 0.17;
    const totalAmount = booking.amount;
    const platformFee = totalAmount * platformFeeRate;
    
    const paidAt = (booking as any).paidAt?.toDate ? (booking as any).paidAt.toDate() : (booking.paidAt ? new Date(booking.paidAt) : null);
    if (!paidAt) return { eligible: false, refundAmount: 0 };

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - paidAt.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Plan-Specific Flags (using amount types and common conventions)
    const isSubscription = booking.status === 'confirmed' && (booking as any).isSubscription;
    const isMonthlyOrCourse = !isSubscription; // Simplified for Admin view context

    if (isMonthlyOrCourse && diffDays >= 15) {
      return { eligible: false, refundAmount: 0, reason: "15-day window expired" };
    }

    // New Split Logic: Tutor 50%, Platform 17%, Student remainder
    const tutorShare = totalAmount * 0.5;
    const refundAmount = totalAmount - tutorShare - platformFee;

    return { 
      eligible: true, 
      refundAmount: Math.max(0, Math.floor(refundAmount)),
      breakdown: { platformFee: Math.floor(platformFee), tutorShare: Math.floor(tutorShare), diffDays }
    };
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'bookings', id), { 
        status: newStatus,
        adminResolutionAt: serverTimestamp()
      });
      setSelectedBooking(null);
    } catch (err) {
      console.error("Failed to update booking status:", err);
      alert("Failed to update status.");
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
            {bookings.filter(b => b.status === 'pending_cancellation').length > 0 && (
              <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full border border-rose-100 flex items-center gap-2 animate-pulse">
                <RefreshCw size={10} className="animate-spin-slow" /> {bookings.filter(b => b.status === 'pending_cancellation').length} Requests
              </span>
            )}
          </h2>
          <p className="text-gray-500 font-medium">Monitor tutoring sessions and handle cancellation/refund requests.</p>
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
        <Table headers={['Student', 'Tutor', 'Subject', 'Date & Time', 'Status']}>
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
                  <span className="text-sm font-bold text-gray-700">{booking.subject}</span>
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
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <Badge 
                  variant={
                    booking.status === 'confirmed' ? 'success' : 
                    booking.status === 'pending' ? 'warning' : 
                    booking.status === 'pending_cancellation' ? 'warning' :
                    'danger'
                  }
                  className={booking.status === 'pending_cancellation' ? 'animate-pulse bg-rose-50 text-rose-600 border-rose-100' : ''}
                >
                  {booking.status === 'pending_cancellation' ? 'Cancel Requested' : booking.status}
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

            {/* Cancellation Review Section */}
            {selectedBooking.status === 'pending_cancellation' && (
              <div className="bg-rose-50 rounded-[2rem] p-8 border border-rose-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/20 rounded-full -mr-12 -mt-12" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                      <AlertTriangle size={20} />
                    </div>
                    <h4 className="text-lg font-black text-rose-900">Refund Review Required</h4>
                  </div>

                  {(() => {
                    const refund = calculateRefund(selectedBooking);
                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Usage Period</span>
                              <span className="text-sm font-bold text-rose-900">{refund.breakdown?.diffDays || 0} Days Used</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Platform Fee (17%)</span>
                              <span className="text-sm font-bold text-rose-900">₹{refund.breakdown?.platformFee || 0}</span>
                            </div>
                          </div>
                          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-rose-100/50 flex flex-col justify-center text-center">
                             <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Calculated Refund</span>
                             <span className="text-3xl font-serif font-black italic text-rose-600">₹{refund.refundAmount}</span>
                          </div>
                        </div>

                        {!refund.eligible && (
                          <p className="text-xs text-rose-500 font-bold bg-white/50 p-3 rounded-xl border border-rose-100 italic">
                             Warning: This booking is {refund.reason}. Standard refund policy may not apply.
                          </p>
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                            onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                            disabled={isProcessing}
                          >
                            <CheckCircle2 size={16} className="mr-2" /> Approve & Refund
                          </Button>
                          <Button 
                            variant="danger"
                            className="flex-1 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                            onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                            disabled={isProcessing}
                          >
                            <XCircle size={16} className="mr-2" /> Reject Request
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* General Actions for other statuses */}
            {selectedBooking.status !== 'pending_cancellation' && (
              <div className="flex gap-3 pt-4">
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
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
