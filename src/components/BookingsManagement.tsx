import * as React from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  BookOpen,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, Tabs, Table, Modal } from './UI';
import { Booking } from '../types';

interface BookingsManagementProps {
  bookings: Booking[];
}

export const BookingsManagement = ({ bookings }: BookingsManagementProps) => {
  const [activeTab, setActiveTab] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredBookings = bookings.filter(b => {
    const matchesTab = activeTab === 'All' || b.status === activeTab.toLowerCase();
    const matchesSearch = b.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.tutorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = ['All', 'Pending', 'Confirmed', 'Cancelled'];


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
        <Table headers={['Student', 'Tutor', 'Subject', 'Date & Time', 'Status']}>
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
                  <span className="text-sm font-bold text-gray-900">{(booking.dateTime || booking.date || '').split(' ')[0]}</span>
                  <span className="text-xs text-gray-500 font-medium">{booking.dateTime ? booking.dateTime.split(' ')[1] : (booking.time || '')}</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'danger'}>
                  {booking.status}
                </Badge>
              </td>
            </motion.tr>
          ))}
          </AnimatePresence>
        </Table>
      </Card>
    </div>
  );
};
