import * as React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Mail,
  GraduationCap,
  Calendar,
  X,
  UserX,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, Table, Modal } from './UI';
import { Student, Booking } from '../types';

interface StudentsManagementProps {
  students: Student[];
  bookings: Booking[];
  onToggleBlock: (id: string, currentStatus: string) => void;
  initialSelectedStudentId?: string | null;
}

const calculateRefund = (booking: any, studentTier: string, startDate?: any, endDate?: any) => {
  if (!booking.amount) return { eligible: false, refundAmount: 0, reason: "No payment found" };

  const totalPaidAmount = booking.amount;
  const tier = studentTier || 'free';
  
  const start = startDate?.toDate ? startDate.toDate() : (startDate ? new Date(startDate) : null);
  const end = endDate?.toDate ? endDate.toDate() : (endDate ? new Date(endDate) : null);
  
  if (!start || !end) return { eligible: false, refundAmount: 0, reason: "Plan duration unknown" };

  const now = new Date();
  const totalDurationMs = end.getTime() - start.getTime();
  const totalDurationDays = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24)) || 30;
  
  const timeSinceStartMs = now.getTime() - start.getTime();
  const daysSinceStart = Math.ceil(timeSinceStartMs / (1000 * 60 * 60 * 24));
  
  const timeUntilEndMs = end.getTime() - now.getTime();
  const daysUntilEnd = Math.ceil(timeUntilEndMs / (1000 * 60 * 60 * 24));

  const attendedClasses = booking.attendedCount || 0;

  if (daysUntilEnd <= 10) {
    return { eligible: false, refundAmount: 0, reason: "Last 10 days of plan", details: "Refunds not allowed in final 10 days." };
  }

  if (daysSinceStart <= 3 && attendedClasses <= 3) {
    const dailyRate = totalPaidAmount / totalDurationDays;
    const attendedCharges = dailyRate * Math.max(daysSinceStart, attendedClasses);
    const platformFee = totalPaidAmount * 0.04;
    const refundAmount = totalPaidAmount - attendedCharges - platformFee;
    
    return { 
      eligible: refundAmount > 0, 
      refundAmount: Math.max(0, Math.floor(refundAmount)), 
      reason: "Initial 3-day Window Refund",
      details: "Full refund minus attended classes and 4% platform fee.",
      breakdown: { totalPaidAmount, attendedCharges: Math.floor(attendedCharges), platformFee: Math.floor(platformFee) }
    };
  }

  if (tier === 'free') {
    return { eligible: false, refundAmount: 0, reason: "Free Plan Window Expired", details: "Free plan students are only eligible for refunds within the first 3 days/classes of enrollment." };
  }

  const refundPercent = tier === 'premium' ? 0.40 : 0.20;
  const refundAmount = totalPaidAmount * refundPercent;

  return {
    eligible: true,
    refundAmount: Math.floor(refundAmount),
    reason: `${tier.toUpperCase()} Plan Partial Refund`,
    details: `${refundPercent * 100}% flat refund based on plan type.`,
    breakdown: { totalPaidAmount, refundPercent: refundPercent * 100 }
  };
};

export const StudentsManagement = ({ students, bookings, onToggleBlock, initialSelectedStudentId = null }: StudentsManagementProps) => {
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(
    initialSelectedStudentId ? students.find(s => s.id === initialSelectedStudentId) || null : null
  );

  React.useEffect(() => {
    if (initialSelectedStudentId) {
      const student = students.find(s => s.id === initialSelectedStudentId);
      if (student) setSelectedStudent(student);
    }
  }, [initialSelectedStudentId, students]);

  const [modalTab, setModalTab] = React.useState<'overview' | 'history'>('overview');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [symbolName, setSymbolName] = React.useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [processingRefund, setProcessingRefund] = React.useState<{ booking: any, calculation: any } | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (action: string, studentName: string) => {
    setSymbolName(`${action} for ${studentName}`);
    setTimeout(() => setSymbolName(null), 3000);
    setOpenMenuId(null);
  };

  const parseBookingDate = (booking: any) => {
    if (booking?.dateTime) {
      const ts = new Date(booking.dateTime).getTime();
      return Number.isNaN(ts) ? 0 : ts;
    }
    if (booking?.date && booking?.time) {
      const ts = new Date(`${booking.date} ${booking.time}`).getTime();
      return Number.isNaN(ts) ? 0 : ts;
    }
    if (booking?.date) {
      const ts = new Date(booking.date).getTime();
      return Number.isNaN(ts) ? 0 : ts;
    }
    return 0;
  };

  const formatBookingDate = (booking: any) => {
    const dateMs = parseBookingDate(booking);
    if (!dateMs) return 'Date unavailable';
    return new Date(dateMs).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStudentActivity = (student: Student) => {
    return bookings
      .filter((b: any) =>
        b.studentId === student.id ||
        b.studentEmail === student.email ||
        b.studentName === student.name ||
        b.name === student.name
      )
      .sort((a: any, b: any) => parseBookingDate(b) - parseBookingDate(a))
      .slice(0, 8);
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10, filter: 'blur(4px)' },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0, 
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 20
      }
    },
  };

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -10, filter: 'blur(10px)' },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 150,
        damping: 15
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: -10, 
      filter: 'blur(10px)',
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Students Management</h2>
          <p className="text-gray-500 font-medium">Manage student accounts and access.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
        </div>
      </motion.div>

      <Card>
        <Table headers={['Student', 'Class', 'Subjects', 'Bookings', 'Registered On', 'Status', 'Actions']}>
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student, index) => {
              const isMenuOpen = openMenuId === student.id;
              return (
              <motion.tr 
                key={student.id} 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                layout
                className={`hover:bg-gray-50/80 transition-all group cursor-default border-b border-gray-100 last:border-0 ${
                  isMenuOpen ? 'relative z-[140]' : 'relative z-0'
                }`}
              >
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-3">
                   <img 
                    src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff`} 
                    alt={student.name} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff`;
                    }}
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{student.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-bold text-gray-700">
                {student.class}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-wrap gap-1">
                  {(student.subjects || []).map((s, idx) => (
                    <span key={`${s}-${idx}`} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-gray-900">{student.totalBookings || 0}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {(student as any).createdAt ? ((student as any).createdAt.toDate ? (student as any).createdAt.toDate().toLocaleString() : new Date((student as any).createdAt).toLocaleString()) : 'N/A'}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <Badge variant={(student.status || 'active') === 'active' ? 'success' : 'danger'}>
                  {student.status || 'active'}
                </Badge>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-2">
                  <div className={isMenuOpen ? "relative z-[160]" : "relative"}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                    >
                      <MoreVertical size={18} />
                    </Button>
                    
                    <AnimatePresence>
                      {isMenuOpen && (
                        <>
                          {/* Backdrop to close menu */}
                          <div 
                            className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[1px]" 
                            onClick={() => setOpenMenuId(null)}
                          />

                          <motion.div 
                            variants={menuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 py-2.5 z-[200] ring-1 ring-black/[0.05] overflow-hidden"
                          >
                            <button 
                              onClick={() => { setSelectedStudent(student); setOpenMenuId(null); }}
                              className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <Eye size={16} className="text-gray-400" />
                              <span>View Profile</span>
                            </button>
                            <div className="h-px bg-gray-50 my-1.5" />
                            <button 
                              onClick={() => { onToggleBlock(student.id, student.status || 'active'); setOpenMenuId(null); }}
                              className={`w-full px-4 py-2.5 text-left text-sm font-bold flex items-center gap-3 transition-colors ${
                                (student.status || 'active') === 'blocked' ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                              }`}
                            >
                              {(student.status || 'active') === 'blocked' ? (
                                <>
                                  <ShieldCheck size={16} />
                                  <span>Unblock Student</span>
                                </>
                              ) : (
                                <>
                                  <UserX size={16} />
                                  <span>Block Student</span>
                                </>
                              )}
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </td>
            </motion.tr>
            );
            })}
          </AnimatePresence>
        </Table>
      </Card>


      <Modal 
        isOpen={!!selectedStudent} 
        onClose={() => { setSelectedStudent(null); setModalTab('overview'); }} 
        title={`${selectedStudent?.name || 'Student'} Profile`}
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Wallet Balance</p>
                <p className="text-xl font-black text-emerald-700">₹{selectedStudent.walletBalance || 0}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Bookings</p>
                <p className="text-xl font-black text-blue-700">{bookings.filter(b => b.studentId === selectedStudent.id).length}</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Refund Requests</p>
                <p className="text-xl font-black text-rose-700">{bookings.filter(b => b.studentId === selectedStudent.id && b.status === 'pending_cancellation').length}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest mb-1">Completed Refunds</p>
                <p className="text-xl font-black text-orange-700">{bookings.filter(b => b.studentId === selectedStudent.id && b.status === 'cancelled').length}</p>
              </div>

            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-100 mb-6">
              <button 
                onClick={() => setModalTab('overview')}
                className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${modalTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setModalTab('history')}
                className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${modalTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
              >
                Booking & Refund History
              </button>
            </div>

            {modalTab === 'overview' ? (
              <>
            <div className="flex items-center space-x-6">
               <img 
                src={selectedStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=random&color=fff`} 
                alt={selectedStudent.name} 
                className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-50 shadow-lg" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=random&color=fff`;
                }}
              />
              <div>
                <h4 className="text-2xl font-black text-gray-900 tracking-tight">{selectedStudent.name}</h4>
                <div className="flex flex-col space-y-1 mt-2">
                  <div className="flex items-center text-sm text-gray-500 font-medium">
                    <Mail size={14} className="mr-2" />
                    {selectedStudent.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 font-medium">
                    <GraduationCap size={14} className="mr-2" />
                    {selectedStudent.class}
                  </div>
                  {selectedStudent.registrationDate && (
                    <div className="flex items-center text-[11px] text-primary/50 font-black uppercase tracking-widest mt-1">
                      <Calendar size={12} className="mr-2" />
                      Joined: {new Date(selectedStudent.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant={selectedStudent.status === 'blocked' ? 'success' : 'danger'}
                  className="rounded-xl flex items-center gap-2 px-6"
                  onClick={() => onToggleBlock(selectedStudent.id, selectedStudent.status || 'active')}
                >
                  {selectedStudent.status === 'blocked' ? (
                    <>
                      <ShieldCheck size={16} />
                      Unblock Student
                    </>
                  ) : (
                    <>
                      <UserX size={16} />
                      Block Student
                    </>
                  )}
                </Button>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                  <Badge variant={selectedStudent.status === 'active' ? 'success' : 'danger'}>
                    {selectedStudent.status}
                  </Badge>
                </div>
                {selectedStudent.upiId && (
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex flex-col gap-1">
                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Student UPI ID</span>
                    <span className="text-xs font-black text-primary font-mono">{selectedStudent.upiId}</span>
                  </div>
                )}
              </div>
            </div>

              </>
            ) : (
              <div className="space-y-6">
                {/* Wallet & Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Previous Amount / Wallet</p>
                    <p className="text-3xl font-black text-primary">₹{selectedStudent.walletBalance || 0}</p>
                    <p className="text-[10px] text-primary/40 font-bold mt-1">Available for re-booking</p>
                  </div>

                </div>

                {/* History Table */}
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject & Tutor</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan & Timings</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount & UPI</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bookings
                          .filter(b => b.studentId === selectedStudent.id)
                          .map((b: any) => (
                          <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-black text-gray-900">{b.subject}</p>
                              <p className="text-[10px] font-bold text-primary">Tutor: {b.tutorName}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                  <Calendar size={10} /> {b.date || b.dateTime?.split(' ')[0]}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold flex items-center gap-2 uppercase">
                                  <Clock size={10} /> {b.startTime || b.time} - {b.endTime || 'N/A'}
                                </p>
                                <Badge variant="default" className="text-[8px] py-0">{b.planName || b.studentType || 'General'}</Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <p className="text-sm font-black text-gray-900">₹{b.amount || 0}</p>
                                <p className="text-[9px] font-mono font-bold text-gray-400">{b.upiId || 'No UPI recorded'}</p>
                                <p className="text-[8px] text-gray-400 font-bold uppercase">{b.paidAt ? `Paid: ${new Date(b.paidAt).toLocaleDateString()}` : ''}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-center gap-2">
                                <Badge variant={
                                  b.status === 'confirmed' || b.status === 'completed' ? 'success' : 
                                  b.status === 'pending_cancellation' ? 'warning' :
                                  'danger'
                                }>
                                  {b.status === 'pending_cancellation' ? 'Cancellation Req' : b.status}
                                </Badge>
                                {b.status === 'pending_cancellation' && (
                                  <div className="flex gap-1">
                                    <button 
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded shadow-sm border border-emerald-100" 
                                      title="Approve Refund"
                                      onClick={() => {
                                        const calc = calculateRefund(b, selectedStudent.subscription?.tier || 'free', selectedStudent.subscription?.startDate, selectedStudent.subscription?.expiresAt);
                                        setProcessingRefund({ booking: b, calculation: calc });
                                      }}
                                    >
                                      <ShieldCheck size={14} />
                                    </button>
                                    <button 
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded shadow-sm border border-rose-100" 
                                      title="Reject Request"
                                      onClick={() => handleAction('Refund Rejection', selectedStudent.name)}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Plan Metadata */}
                <Card className="p-6 bg-slate-50 border-slate-100">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Enrollment & Plan Status</h5>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Current Tier / Plan</p>
                      <p className="text-sm font-black text-gray-900 uppercase">
                        {selectedStudent.subscription?.tier || 'Free Plan'} 
                        <span className="text-[10px] text-gray-400 ml-2 font-bold tracking-tight">({selectedStudent.class})</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Start Date</p>
                        <p className="text-xs font-bold text-gray-700">
                          {selectedStudent.subscription?.startDate ? 
                            new Date(selectedStudent.subscription.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 
                            selectedStudent.registrationDate ? 
                            new Date(selectedStudent.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 
                            'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Renewal Date</p>
                        <p className="text-xs font-bold text-gray-700">
                          {selectedStudent.subscription?.expiresAt ? 
                            new Date(selectedStudent.subscription.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 
                            'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Refund Processing Modal */}
      <Modal
        isOpen={!!processingRefund}
        onClose={() => setProcessingRefund(null)}
        title="Process Refund Request"
      >
        {processingRefund && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h6 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Booking Subject</h6>
                  <p className="text-sm font-black text-gray-900">{processingRefund.booking.subject}</p>
                </div>
                <div className="text-right">
                  <h6 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</h6>
                  <p className="text-lg font-black text-gray-900">₹{processingRefund.booking.amount}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cancellation Reason</h6>
                  <p className="text-xs font-bold text-gray-600">{processingRefund.booking.cancellationReason || 'No reason provided'}</p>
                </div>
                <div>
                  <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Preferences</h6>
                  <div className="flex flex-col gap-1">
                    <Badge variant={processingRefund.booking.bookedAnotherTutor ? 'success' : 'default'} className="text-[8px] py-0 w-fit">
                      {processingRefund.booking.bookedAnotherTutor ? 'Wants Another Tutor' : 'No New Tutor'}
                    </Badge>
                    <Badge variant={processingRefund.booking.wantsRefund ? 'warning' : 'default'} className="text-[8px] py-0 w-fit">
                      {processingRefund.booking.wantsRefund ? 'Requested Refund' : 'No Refund Req'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${processingRefund.calculation.eligible ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                {processingRefund.calculation.eligible ? (
                  <ShieldCheck className="text-emerald-600" size={24} />
                ) : (
                  <Clock className="text-rose-600" size={24} />
                )}
                <div>
                  <h6 className={`text-xs font-black uppercase tracking-widest ${processingRefund.calculation.eligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                    Refund Eligibility: {processingRefund.calculation.eligible ? 'Approved' : 'Ineligible'}
                  </h6>
                  <p className={`text-[10px] font-bold ${processingRefund.calculation.eligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {processingRefund.calculation.reason}
                  </p>
                </div>
              </div>

              {processingRefund.calculation.eligible ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-emerald-200/50">
                    <span className="text-xs font-bold text-emerald-800/60">Estimated Refund Amount</span>
                    <span className="text-xl font-black text-emerald-900">₹{processingRefund.calculation.refundAmount}</span>
                  </div>
                  <p className="text-[10px] font-medium text-emerald-700/70 italic">
                    {processingRefund.calculation.details}
                  </p>
                  {processingRefund.calculation.breakdown && (
                    <div className="pt-2 grid grid-cols-2 gap-y-1">
                      {processingRefund.calculation.breakdown.attendedCharges && (
                        <>
                          <span className="text-[9px] font-bold text-emerald-800/40 uppercase">Class Deductions</span>
                          <span className="text-[9px] font-black text-emerald-800 text-right">-₹{processingRefund.calculation.breakdown.attendedCharges}</span>
                        </>
                      )}
                      {processingRefund.calculation.breakdown.platformFee && (
                        <>
                          <span className="text-[9px] font-bold text-emerald-800/40 uppercase">Platform Fee (4%)</span>
                          <span className="text-[9px] font-black text-emerald-800 text-right">-₹{processingRefund.calculation.breakdown.platformFee}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-rose-800">{processingRefund.calculation.details}</p>
                  <p className="text-[10px] font-medium text-rose-700/60">As per the platform's refund policy, cancellations within the last 10 days or for free plans do not qualify for monetary refunds.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="ghost" 
                className="flex-1 rounded-xl"
                onClick={() => setProcessingRefund(null)}
              >
                Close
              </Button>
              {processingRefund.calculation.eligible && (
                <Button 
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/10"
                  onClick={() => handleAction('Refund Approval', selectedStudent?.name || '')}
                  disabled={isUpdating}
                >
                  Confirm & Process ₹{processingRefund.calculation.refundAmount}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
