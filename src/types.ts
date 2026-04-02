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
  subjects: string[];
  experience: string;
  status: 'pending' | 'approved' | 'rejected';
  bio: string;
  avatar: string;
  joinedDate: string;
  documents: { name: string; status: 'verified' | 'pending' }[];
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
