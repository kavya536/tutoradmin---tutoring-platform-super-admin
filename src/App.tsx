import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TutorsManagement } from './components/TutorsManagement';
import { StudentsManagement } from './components/StudentsManagement';
import { BookingsManagement } from './components/BookingsManagement';
import { PaymentsManagement } from './components/PaymentsManagement';
import { ReviewsManagement } from './components/ReviewsManagement';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { 
  MOCK_TUTORS, 
  MOCK_STUDENTS, 
  MOCK_BOOKINGS, 
  MOCK_PAYMENTS, 
  MOCK_REVIEWS, 
  MOCK_NOTIFICATIONS 
} from './mockData';
import { Tutor, Student, Booking, Payment, Review, Notification } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [activePage, setActivePage] = React.useState('dashboard');
  
  // App State
  const [tutors, setTutors] = React.useState<Tutor[]>(MOCK_TUTORS);
  const [students, setStudents] = React.useState<Student[]>(MOCK_STUDENTS);
  const [bookings, setBookings] = React.useState<Booking[]>(MOCK_BOOKINGS);
  const [payments, setPayments] = React.useState<Payment[]>(MOCK_PAYMENTS);
  const [reviews, setReviews] = React.useState<Review[]>(MOCK_REVIEWS);
  const [notifications, setNotifications] = React.useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Simulated Actions
  const handleApproveTutor = (id: string) => {
    setTutors(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    addNotification('Tutor Approved', `Tutor application for ${tutors.find(t => t.id === id)?.name} has been approved.`, 'success');
  };

  const handleRejectTutor = (id: string, reason?: string) => {
    setTutors(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
    const tutor = tutors.find(t => t.id === id);
    addNotification('Tutor Rejected', `Tutor application for ${tutor?.name} has been rejected.${reason ? ` Reason: ${reason}` : ''}`, 'warning');
    
    if (reason) {
      console.log(`Sending email to ${tutor?.email}: Your application was rejected. Reason: ${reason}`);
      addNotification('Email Sent', `Rejection reason sent to ${tutor?.email}`, 'info');
    }
  };

  const handleToggleBlockStudent = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'blocked' : 'active' } : s));
    const student = students.find(s => s.id === id);
    addNotification(
      student?.status === 'active' ? 'Student Blocked' : 'Student Unblocked', 
      `Student ${student?.name} has been ${student?.status === 'active' ? 'blocked' : 'unblocked'}.`, 
      student?.status === 'active' ? 'warning' : 'success'
    );
  };

  const handleCancelBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    addNotification('Booking Cancelled', 'A booking has been cancelled by the administrator.', 'warning');
  };

  const handleMarkAsPaid = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
    addNotification('Payment Completed', `Payout for ${payments.find(p => p.id === id)?.tutorName} marked as paid.`, 'success');
  };

  const handleDeleteReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    addNotification('Review Deleted', 'An inappropriate review has been removed.', 'info');
  };

  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: 'Just now',
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    const getPageContent = () => {
      switch (activePage) {
        case 'dashboard':
          return <Dashboard tutors={tutors} students={students} bookings={bookings} payments={payments} setActivePage={setActivePage} />;
        case 'tutors':
          return <TutorsManagement tutors={tutors} onApprove={handleApproveTutor} onReject={handleRejectTutor} />;
        case 'students':
          return <StudentsManagement students={students} onToggleBlock={handleToggleBlockStudent} />;
        case 'bookings':
          return <BookingsManagement bookings={bookings} onCancel={handleCancelBooking} />;
        case 'payments':
          return <PaymentsManagement payments={payments} onMarkAsPaid={handleMarkAsPaid} />;
        case 'reviews':
          return <ReviewsManagement reviews={reviews} onDelete={handleDeleteReview} />;
        case 'reports':
          return <Reports />;
        case 'settings':
          return <Settings />;
        default:
          return <Dashboard tutors={tutors} students={students} bookings={bookings} payments={payments} setActivePage={setActivePage} />;
      }
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {getPageContent()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <Layout 
      activePage={activePage} 
      setActivePage={setActivePage} 
      onLogout={() => setIsAuthenticated(false)}
      notifications={notifications}
    >
      {renderPage()}
    </Layout>
  );
}
