import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Status = 'pending' | 'approved' | 'rejected' | 'confirmed' | 'cancelled' | 'paid' | 'blocked' | 'active';

export interface Tutor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  // Registration stores qualification (not subjects array)
  qualification?: string;
  subjects?: string[];
  experience: string;
  status: 'pending' | 'approved' | 'rejected';
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
  status: 'pending' | 'confirmed' | 'cancelled';
  cancellationReason?: string;
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
