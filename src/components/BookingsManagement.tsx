import * as React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye,
  XCircle,
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle2,
  Mail,
  MessageSquare,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, Tabs, Table, Modal } from './UI';
import { Booking } from '../types';

interface BookingsManagementProps {
  bookings: Booking[];
  onCancel: (id: string) => void;
}

export const BookingsManagement = ({ bookings, onCancel }: BookingsManagementProps) => {
  const [activeTab, setActiveTab] = React.useState('All');
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredBookings = bookings.filter(b => {
    const matchesTab = activeTab === 'All' || b.status === activeTab.toLowerCase();
    const matchesSearch = b.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.tutorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = ['All', 'Pending', 'Confirmed', 'Cancelled'];

  const handleMenuAction = (action: string, bookingId: string) => {
    alert(`${action} for booking #${bookingId}... (Feature coming soon)`);
    setOpenMenuId(null);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: {
        duration: 0.3,
        ease: 'easeOut'
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
        type: 'spring',
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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bookings Management</h2>
          <p className="text-gray-500 font-medium">Monitor and manage all tutoring sessions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
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

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <Card>
        <Table headers={['Student', 'Tutor', 'Subject', 'Date & Time', 'Status', 'Actions']}>
          <AnimatePresence mode="popLayout">
            {filteredBookings.map((booking, index) => (
              <motion.tr 
                key={booking.id} 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                layout
                className="hover:bg-gray-50/80 transition-all group cursor-default border-b border-gray-100 last:border-0"
              >
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{booking.studentName}</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{booking.tutorName}</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-2">
                  <BookOpen size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{booking.subject}</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{booking.dateTime.split(' ')[0]}</span>
                  <span className="text-xs text-gray-500 font-medium">{booking.dateTime.split(' ')[1]}</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'danger'}>
                  {booking.status}
                </Badge>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-2 relative">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(booking)}>
                    <Eye size={18} />
                  </Button>
                  {booking.status !== 'cancelled' && (
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => onCancel(booking.id)}>
                      <XCircle size={18} />
                    </Button>
                  )}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-bold text-xs"
                      onClick={() => setOpenMenuId(openMenuId === booking.id ? null : booking.id)}
                    >
                      Actions
                      <MoreVertical size={14} className="ml-1" />
                    </Button>
                    
                    <AnimatePresence>
                      {openMenuId === booking.id && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)} 
                          />
                          <motion.div 
                            variants={menuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20 overflow-hidden"
                          >
                            <button 
                              onClick={() => handleMenuAction('Rescheduling', booking.id)}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <Calendar size={14} />
                              <span>Reschedule</span>
                            </button>
                            <button 
                              onClick={() => handleMenuAction('Messaging Student', booking.id)}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <MessageSquare size={14} />
                              <span>Message Student</span>
                            </button>
                            <button 
                              onClick={() => handleMenuAction('Messaging Tutor', booking.id)}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <Mail size={14} />
                              <span>Message Tutor</span>
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <div className="h-px bg-gray-100 my-1" />
                                <button 
                                  onClick={() => handleMenuAction('Confirming', booking.id)}
                                  className="w-full px-4 py-2 text-left text-sm font-bold text-green-600 hover:bg-green-50 flex items-center space-x-2 transition-colors"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Confirm Booking</span>
                                </button>
                              </>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </td>
            </motion.tr>
          ))}
          </AnimatePresence>
        </Table>
      </Card>

      <Modal 
        isOpen={!!selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
        title="Booking Details"
      >
        {selectedBooking && (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking ID</p>
                <p className="text-lg font-black text-gray-900">#BK-{selectedBooking.id.padStart(4, '0')}</p>
              </div>
              <Badge variant={selectedBooking.status === 'confirmed' ? 'success' : selectedBooking.status === 'pending' ? 'warning' : 'danger'}>
                {selectedBooking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</p>
                    <p className="text-lg font-bold text-gray-900">{selectedBooking.studentName}</p>
                    <Button variant="ghost" size="sm" className="mt-1 -ml-2 text-primary font-bold">View Profile</Button>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/5 rounded-xl text-primary">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tutor</p>
                    <p className="text-lg font-bold text-gray-900">{selectedBooking.tutorName}</p>
                    <Button variant="ghost" size="sm" className="mt-1 -ml-2 text-primary font-bold">View Profile</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-500">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</p>
                    <p className="text-lg font-bold text-gray-900">{selectedBooking.dateTime}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1 font-medium">
                      <Clock size={12} className="mr-1" />
                      60 Minutes Session
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-500">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</p>
                    <p className="text-lg font-bold text-gray-900">{selectedBooking.subject}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
              {selectedBooking.status !== 'cancelled' && (
                <Button variant="danger" onClick={() => { onCancel(selectedBooking.id); setSelectedBooking(null); }}>
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
