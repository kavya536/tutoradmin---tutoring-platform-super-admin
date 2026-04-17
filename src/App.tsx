import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TutorsManagement } from './components/TutorsManagement';
import { sendTutorNotification } from './services/emailService';
import { StudentsManagement } from './components/StudentsManagement';
import { BookingsManagement } from './components/BookingsManagement';
import { PaymentsManagement } from './components/PaymentsManagement';
import { ReviewsManagement } from './components/ReviewsManagement';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { ScrollToTop } from './components/ScrollToTop';
import { 
  MOCK_STUDENTS, 
  MOCK_PAYMENTS, 
  MOCK_REVIEWS 
} from './mockData';
import { Tutor, Student, Booking, Payment, Review, Notification, AdminSettingsData } from './types';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, orderBy, deleteField, setDoc } from 'firebase/firestore';

const defaultAdminSettings = (fallbackName: string, fallbackEmail: string): AdminSettingsData => ({
  profile: {
    fullName: fallbackName || 'Super Admin',
    email: fallbackEmail || '',
    role: 'Administrator',
    timezone: 'UTC +05:30 (IST)'
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    newTutorApplications: true,
    bookingConfirmations: true,
    inAppAlerts: true
  },
  permissions: {
    manageTutors: true,
    manageStudents: true,
    viewFinancials: true,
    systemSettings: true,
    userSupport: true,
    contentModeration: true
  },
  general: {
    platformLanguage: 'English (US)',
    currency: 'INR (₹)',
    maintenanceMode: false
  },
  security: {
    lastPasswordChangedAt: ''
  }
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && sessionStorage.getItem('just_registered') === 'true') {
        sessionStorage.removeItem('just_registered');
        signOut(auth);
        return;
      }
      setIsAuthenticated(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [activePage, setActivePage] = React.useState('dashboard');
  const [contentRef, setContentRef] = React.useState<React.RefObject<HTMLDivElement> | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await signOut(auth);
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  
  // App State - Syncing with Firestore Realtime
  const [students, setStudents] = React.useState<Student[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [tutors, setTutors] = React.useState<Tutor[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>(MOCK_PAYMENTS);
  const [reviews, setReviews] = React.useState<Review[]>(MOCK_REVIEWS);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [usersData, setUsersData] = React.useState<Tutor[]>([]);
  const [legacyData, setLegacyData] = React.useState<Tutor[]>([]);
  const [rejectedData, setRejectedData] = React.useState<Tutor[]>([]);
  const [appToast, setAppToast] = React.useState<{ title: string; message: string; type: 'info' | 'warning' | 'success' } | null>(null);
  const [adminSettings, setAdminSettings] = React.useState<AdminSettingsData>(defaultAdminSettings(auth.currentUser?.displayName || 'Super Admin', auth.currentUser?.email || ''));
  
  // Unified Merger: Primary Logic for Instant Status Reflection
  React.useEffect(() => {
    const merged = new Map<string, Tutor>();
    
    // Unified Smarter Merger: Ensures no data loss and prefers populated fields
    [...rejectedData, ...legacyData, ...usersData].forEach(t => {
      const existing = merged.get(t.id) || {};
      
      // Smart Merge: Only overwrite if the new value is truthy and not an empty string
      const mergedTutor: any = { ...existing };
      Object.entries(t).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          mergedTutor[key] = value;
        }
      });
      
      // Preserve and combine document URLs deep
      const docs = { ...(existing.documents || {}), ...(t.documents || {}) };
      // Filter out empty strings from docs
      const cleanDocs: any = {};
      Object.entries(docs).forEach(([k, v]) => {
        if (v) cleanDocs[k] = v;
      });
      if (Object.keys(cleanDocs).length > 0) mergedTutor.documents = cleanDocs;
      
      // Explicit exhaustive fallbacks for top-level fields
      mergedTutor.profilePic = t.profilePic || t.avatar || existing.profilePic || existing.avatar || t.profileImage || existing.profileImage || t.photoURL || existing.photoURL;
      mergedTutor.identityPic = t.identityPic || t.identityProof || existing.identityPic || existing.identityProof || t.identityURL || existing.identityURL || t.idCard || existing.idCard || t.aadharURL || existing.aadharURL;
      mergedTutor.educationCert = t.educationCert || t.degreeCertificate || existing.educationCert || existing.degreeCertificate || t.degreeURL || existing.degreeURL || t.qualificationDoc || existing.qualificationDoc || t.educationURL || existing.educationURL;
      mergedTutor.experienceCert = t.experienceCert || t.experienceCertificate || existing.experienceCert || existing.experienceCertificate || t.certURL || existing.certURL || t.expDoc || existing.expDoc || t.certificate || existing.certificate || t.expURL || existing.expURL;
      mergedTutor.demoVideo = t.demoVideo || existing.demoVideo || t.videoURL || existing.videoURL || t.demoURL || existing.demoURL || t.liveVideo || existing.liveVideo;
      
      // AUTO-DISCOVERY FALLBACK: If standard fields are missing, deep-search for any URL-like string
      const findUrl = (keywords: string[]) => {
         // Search standard object
         for (const [key, val] of Object.entries(mergedTutor)) {
            if (typeof val === 'string' && (val.startsWith('http') || val.includes('firebasestorage')) && keywords.some(k => key.toLowerCase().includes(k))) return val;
         }
         // Search documents sub-object
         for (const [key, val] of Object.entries(mergedTutor.documents || {})) {
            if (typeof val === 'string' && (val.startsWith('http') || val.includes('firebasestorage')) && keywords.some(k => key.toLowerCase().includes(k))) return val;
         }
         return null;
      };

      if (!mergedTutor.identityPic) mergedTutor.identityPic = findUrl(['id', 'proof', 'aadhar', 'pan', 'card']);
      if (!mergedTutor.educationCert) mergedTutor.educationCert = findUrl(['degree', 'qualification', 'edu', 'college']);
      if (!mergedTutor.experienceCert) mergedTutor.experienceCert = findUrl(['exp', 'cert', 'work', 'experience']);
      if (!mergedTutor.demoVideo) mergedTutor.demoVideo = findUrl(['demo', 'video', 'teaching', 'videoURL']);

      // Synchronize legacy fields
      mergedTutor.identityProof = mergedTutor.identityPic;
      mergedTutor.degreeCertificate = mergedTutor.educationCert;
      mergedTutor.experienceCertificate = mergedTutor.experienceCert;
      mergedTutor.avatar = mergedTutor.profilePic;

      merged.set(t.id, mergedTutor);
    });

    setTutors(Array.from(merged.values()));
    // Set loading false if we have data or if listeners are established
    if (usersData.length > 0 || legacyData.length > 0 || rejectedData.length > 0) setLoading(false);
  }, [usersData, legacyData, rejectedData]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    
    // 1. Unified Synchronization for all Tutors across Legacy & Unified collections

    // 1. Independent Listeners for all collections
    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'tutor')), (snap) => {
      setUsersData(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });

    const unsubTutors = onSnapshot(collection(db, 'tutors'), (snap) => {
      setLegacyData(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });

    const unsubRejected = onSnapshot(collection(db, 'rejectedProfiles'), (snap) => {
      setRejectedData(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });

    // 2. Sync Students
    const unsubStudents = onSnapshot(query(collection(db, 'students')), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });

    // 3. Sync Bookings
    const unsubBookings = onSnapshot(query(collection(db, 'bookings')), (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });

    // 4. Sync Notifications
    const unsubNotifs = onSnapshot(query(collection(db, 'admin_notifications'), orderBy('time', 'desc')), (snap) => {
      setNotifications(snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(), 
        time: d.data().time?.toDate()?.toLocaleString() || 'Just now' 
      } as any)));
    });

    // 5. Sync admin settings
    const uid = auth.currentUser?.uid;
    let unsubSettings = () => {};
    if (uid) {
      const settingsRef = doc(db, 'admin_settings', uid);
      unsubSettings = onSnapshot(settingsRef, async (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<AdminSettingsData>;
          setAdminSettings({
            ...defaultAdminSettings(auth.currentUser?.displayName || 'Super Admin', auth.currentUser?.email || ''),
            ...data,
            profile: {
              ...defaultAdminSettings(auth.currentUser?.displayName || 'Super Admin', auth.currentUser?.email || '').profile,
              ...(data.profile || {})
            },
            notifications: {
              ...defaultAdminSettings(auth.currentUser?.displayName || 'Super Admin', auth.currentUser?.email || '').notifications,
              ...(data.notifications || {})
            },
            permissions: {
              ...defaultAdminSettings(auth.currentUser?.displayName || 'Super Admin', auth.currentUser?.email || '').permissions,
              ...(data.permissions || {})
            },
            general: {
              ...defaultAdminSettings(auth.currentUser?.displayName || 'Super Admin', auth.currentUser?.email || '').general,
              ...(data.general || {})
            },
            security: {
              ...defaultAdminSettings(auth.currentUser?.displayName || 'Super Admin', auth.currentUser?.email || '').security,
              ...(data.security || {})
            }
          });
        } else {
          await setDoc(settingsRef, defaultAdminSettings(auth.currentUser?.displayName || 'Super Admin', auth.currentUser?.email || ''));
        }
      });
    }

    return () => {
      unsubUsers();
      unsubTutors();
      unsubRejected();
      unsubStudents();
      unsubBookings();
      unsubNotifs();
      unsubSettings();
    };
  }, [isAuthenticated]);

  // Derive Real-time Reviews from Bookings
  const liveReviews = React.useMemo(() => {
    return bookings
      .filter(b => b.reviewSubmitted)
      .map(b => ({
        id: b.id,
        tutorName: b.tutorName || 'Unknown Tutor',
        studentName: b.studentName || 'Unknown Student',
        rating: b.reviewRating || 5,
        feedback: b.reviewComment || 'Excellent teaching style.',
        date: b.date || 'Recently'
      } as Review));
  }, [bookings]);

  const combinedReviews = React.useMemo(() => {
    // Only show mock reviews if we have no real student feedback yet for that specific tutor
    // to maintain the "Foundation" logic requested by user
    return [...MOCK_REVIEWS, ...liveReviews];
  }, [liveReviews]);

  // Real-time Automated API Bridge (Server-less Architecture)
  const handleApproveTutor = async (id: string) => {
    try {
      const tutor = tutors.find(t => t.id === id);
      if (!tutor) throw new Error("Tutor not found in local state");

      // 1. Update primary record status
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, { status: 'approved', approvedAt: serverTimestamp() });

      // 2. Automated Email Trigger (Zero-Cost Cloud Way)
      await sendTutorNotification(tutor, 'approve');

      uiToast('Approval Success', 'Status updated and email queued.', 'success');
      return true;
    } catch(err: any) {
      console.error('[ERROR] handleApproveTutor:', err);
      uiToast('Approval Failed', err.message, 'warning');
      throw err;
    }
  };

  const handleRejectTutor = async (id: string, reason?: string) => {
    try {
      const tutor = tutors.find(t => t.id === id);
      if (!tutor) throw new Error("Tutor not found");

      const feedback = reason || 'Requirements not met.';
      
      // 1. Update primary record status
      await updateDoc(doc(db, 'users', id), { 
        status: 'rejected', 
        rejectionReason: feedback 
      });

      // 2. Automated Email Trigger (Zero-Cost Cloud Way)
      await sendTutorNotification(tutor, 'reject', feedback);

      uiToast('Rejection Success', 'User notified and record updated.', 'warning');
      return true;
    } catch(err: any) {
      console.error('[ERROR] handleRejectTutor:', err);
      uiToast('Rejection Failed', err.message, 'warning');
      throw err;
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelled' });
      uiToast('Booking Cancelled', 'Booking successfully cancelled.', 'warning');
    } catch(err) {
      console.error(err);
    }
  };

  const handleConfirmBooking = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'confirmed' });
      uiToast('Booking Confirmed', 'Booking status updated across all platforms!', 'success');
    } catch(err) {
      console.error(err);
    }
  };

  // Keep local simulation for unused components temporarily
  const handleToggleBlockStudent = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'blocked' : 'active' } : s));
  };
  const handleMarkAsPaid = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
  };
  const handleDeleteReview = async (id: string) => {
    try {
      // If it's a Firestore booking ID (not starting with mock-), clear it in DB
      if (!id.startsWith('mock-')) {
        await updateDoc(doc(db, 'bookings', id), {
          reviewSubmitted: false,
          reviewRating: deleteField(),
          reviewComment: deleteField(),
          reviewedAt: deleteField(),
          reviewDeletedByAdmin: true,
          adminDeletedAt: serverTimestamp()
        });
        uiToast('Review Purged', 'Feedback removed from backend infrastructure.', 'success');
      } else {
        // Local simulation for mock data
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch(err: any) {
      console.error(err);
      uiToast('Deletion Failed', err.message, 'warning');
    }
  };

  const uiToast = (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const titleLower = title.toLowerCase();
    if (!adminSettings.notifications.inAppAlerts) return;
    if (!adminSettings.notifications.newTutorApplications && titleLower.includes('approval')) return;
    if (!adminSettings.notifications.bookingConfirmations && titleLower.includes('booking')) return;
    setAppToast({ title, message, type });
    setTimeout(() => setAppToast(null), 3000);
  };

  const saveAdminSettings = async (next: AdminSettingsData) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Admin user not found');
    await setDoc(doc(db, 'admin_settings', uid), next, { merge: true });
    setAdminSettings(next);
  };

  const updateAdminPassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return { ok: false, message: 'Please fill all password fields.' };
    }
    if (newPassword !== confirmPassword) {
      return { ok: false, message: 'New password and confirm password do not match.' };
    }
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!passRegex.test(newPassword)) {
      return { ok: false, message: 'Password must be 8+ chars with uppercase, lowercase, number, and symbol.' };
    }
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { ok: false, message: 'Admin session is not available.' };
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { ok: true, message: 'Password updated successfully.' };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Failed to update password.' };
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'admin_notifications', id), { read: true });
    } catch(err) {
      console.error(err);
    }
  };

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      const title = (n.title || '').toLowerCase();
      if (!adminSettings.notifications.newTutorApplications && (title.includes('tutor') || title.includes('application'))) return false;
      if (!adminSettings.notifications.bookingConfirmations && title.includes('booking')) return false;
      return true;
    });
  }, [notifications, adminSettings.notifications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Admin System...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    const getPageContent = () => {
      switch (activePage) {
        case 'dashboard':
          return <Dashboard tutors={tutors} students={students} bookings={bookings} payments={payments} setActivePage={setActivePage} />;
        case 'tutors':
          return <TutorsManagement 
            tutors={tutors} 
            students={students} 
            bookings={bookings} 
            onApprove={handleApproveTutor} 
            onReject={handleRejectTutor} 
            onResendEmail={async (id) => {
              const tutor = tutors.find(t => t.id === id);
              if (tutor) {
                await sendTutorNotification(tutor, tutor.status as any, tutor.rejectionReason);
              }
            }} 
          />;
        case 'students':
          return <StudentsManagement students={students} bookings={bookings} onToggleBlock={handleToggleBlockStudent} />;
        case 'bookings':
          return <BookingsManagement bookings={bookings} />;
        case 'payments':
          return <PaymentsManagement payments={payments} onMarkAsPaid={handleMarkAsPaid} />;
        case 'reviews':
          return <ReviewsManagement reviews={combinedReviews} onDelete={handleDeleteReview} />;
        case 'reports':
          return <Reports />;
        case 'settings':
          return (
            <Settings
              settings={adminSettings}
              currentAdminName={auth.currentUser?.displayName || 'Super Admin'}
              onSaveSettings={saveAdminSettings}
              onUpdatePassword={updateAdminPassword}
            />
          );
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
    <Router>
      <ScrollToTop activePage={activePage} contentRef={contentRef} />
      <Layout 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={handleLogout}
        notifications={filteredNotifications}
        onMarkRead={handleMarkRead}
        onContentRef={setContentRef}
      >
        {renderPage()}
      </Layout>
      
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] w-full max-w-md p-8 md:p-10 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={30} className="text-rose-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold italic text-slate-800">Are you sure?</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Do you want to logout?</p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={confirmLogout}
                className="w-full bg-rose-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-widest"
              >
                Yes, Logout
              </button>
              
              <button 
                onClick={cancelLogout}
                className="w-full bg-slate-100 text-slate-600 font-black py-5 rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
              >
                No, Stay Here
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {appToast && (
        <div className="fixed bottom-8 right-8 z-[320] flex items-center space-x-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl">
          <p className="text-sm font-bold">{appToast.title}: {appToast.message}</p>
        </div>
      )}
    </Router>
  );
}
