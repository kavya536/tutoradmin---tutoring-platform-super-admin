import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RejectionHistory {
  reason: string;
  date: string;
  time: string;
  action: 'rejected' | 'approved';
}

export interface Tutor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  upiId?: string;
  registrationDate?: string;
  rejectionCount?: number;
  approvalHistory?: RejectionHistory[];
  // Registration stores qualification (not subjects array)
  qualification?: string;
  targetClasses?: string;
  subjects?: string[];
  experience: string;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  bio?: string;
  avatar?: string;
  joinedDate?: string;
  createdAt?: any;
  // Documents stored as URLs in Firestore (including various fallback names)
  identityProof?: string;
  identityURL?: string;
  identityPic?: string; // Fallback
  aadharURL?: string; // Fallback
  idCard?: string;
  certificate?: string; // Legacy field
  certURL?: string;
  experienceCertificate?: string;
  experienceCert?: string; // Fallback
  expDoc?: string;
  expURL?: string; // Fallback
  degreeCertificate?: string;
  degreeURL?: string;
  educationURL?: string; // Fallback
  educationCert?: string; // Fallback
  qualificationDoc?: string;
  demoVideo?: string;
  videoURL?: string;
  demoURL?: string; // Fallback
  liveVideo?: string; // Fallback
  documents?: {
    profileImage?: string;
    identityProof?: string;
    degreeCertificate?: string;
    experienceCertificate?: string;
    demoVideo?: string;
  };
  rating?: number;
  rejectionReason?: string;
  rejectedAt?: any;
  approvedAt?: any;
  profilePic?: string; // Legacy/Auth sync
  profileImage?: string; // Legacy/Auth sync
  photoURL?: string; // Legacy/Auth sync
}

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  subjects: string[];
  totalBookings: number;
  status: 'active' | 'blocked';
  avatar: string;
  upiId?: string;
  registrationDate?: string;
  walletBalance?: number;
  subscription?: {
    tier: 'free' | 'standard' | 'premium';
    startDate?: any;
    expiresAt?: any;
  };
}

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  tutorName: string;
  subject: string;
  dateTime: string;
  date?: string;
  time?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'pending_cancellation' | 'approved_cancellation' | 'rejected_cancellation' | 'refund_processing' | 'refund_completed';
  studentReason?: string;
  requestType?: string;
  cancellationReason?: string;
  amount?: number;
  tutorId: string;
  paidAt?: any;
  studentType?: string;
  studentEmail?: string;
  reviewSubmitted?: boolean;
  reviewRating?: number;
  reviewComment?: string;
  reviewedAt?: any;
  duration?: string;
  wantsNewTutor?: boolean;
  isCancelled?: boolean;
  bookedAnotherTutor?: boolean;
  alreadyGotRefund?: boolean;
  cancellationAdminStatus?: 'pending' | 'approved' | 'rejected';
  refundStatus?: 'none' | 'pending' | 'paid' | 'failed' | 'completed';
  tutorPayoutStatus?: 'pending' | 'paid';
  tutorPayoutDate?: string;
  startTime?: string;
  endTime?: string;
  upiId?: string;
  transactionLedger?: Array<{
    amount: number;
    type: string;
    date: string;
    time: string;
    status: string;
    upiId?: string;
  }>;
  planName?: string;
  planStartDate?: string;
  planEndDate?: string;
  autoRefunded?: boolean;
  refundAmount?: number;
  cancellationAdminReason?: string;
  adminResolutionAt?: any;
  wantsRefund?: boolean;
}

export interface Payment {
  id: string;
  tutorName: string;
  amount: number;
  status: 'pending' | 'paid';
  method: 'UPI' | 'Bank';
  date: string;
}

export interface Review {
  id: string;
  studentName: string;
  tutorName: string;
  rating: number;
  feedback: string;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  targetId?: string;
  tutorId?: string;
  studentId?: string;
  bookingId?: string;
  category?: string;
}

export interface AdminSettingsData {
  profile: {
    fullName: string;
    email: string;
    role: string;
    timezone: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newTutorApplications: boolean;
    bookingConfirmations: boolean;
    inAppAlerts: boolean;
  };
  permissions: {
    manageTutors: boolean;
    manageStudents: boolean;
    viewFinancials: boolean;
    systemSettings: boolean;
    userSupport: boolean;
    contentModeration: boolean;
  };
  general: {
    platformLanguage: string;
    currency: string;
    maintenanceMode: boolean;
  };
  security: {
    lastPasswordChangedAt: string;
  };
}

export interface LandingQuery {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  status: 'new' | 'responded' | 'resolved';
  createdAt: any;
}
