import { Tutor, Student, Booking, Payment, Review, Notification } from './types';

export const MOCK_TUTORS: Tutor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    email: 'sarah.w@example.com',
    subjects: ['Mathematics', 'Physics'],
    experience: '8 Years',
    status: 'approved',
    bio: 'Passionate educator with a PhD in Physics. I love making complex concepts simple.',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    joinedDate: '2023-10-15',
    documents: [
      { name: 'Degree Certificate', status: 'verified' },
      { name: 'ID Proof', status: 'verified' }
    ] as any
  },
  {
    id: '2',
    name: 'James Miller',
    email: 'james.m@example.com',
    subjects: ['English Literature', 'History'],
    experience: '5 Years',
    status: 'pending',
    bio: 'Creative writing enthusiast. Helping students find their voice through literature.',
    avatar: 'https://picsum.photos/seed/james/100/100',
    joinedDate: '2024-01-20',
    documents: [
      { name: 'Masters Degree', status: 'pending' },
      { name: 'Teaching License', status: 'pending' }
    ] as any
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    subjects: ['Spanish', 'French'],
    experience: '12 Years',
    status: 'approved',
    bio: 'Native speaker with extensive experience in language acquisition for all ages.',
    avatar: 'https://picsum.photos/seed/elena/100/100',
    joinedDate: '2023-05-12',
    documents: [
      { name: 'Language Proficiency', status: 'verified' },
      { name: 'Work Permit', status: 'verified' }
    ] as any
  },
  {
    id: '4',
    name: 'Robert Chen',
    email: 'robert.c@example.com',
    subjects: ['Computer Science', 'AI'],
    experience: '3 Years',
    status: 'rejected',
    bio: 'Software engineer turned tutor. Focused on practical coding skills.',
    avatar: 'https://picsum.photos/seed/robert/100/100',
    joinedDate: '2023-12-05',
    documents: [
      { name: 'B.Tech Certificate', status: 'verified' }
    ] as any
  }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Alice Thompson',
    email: 'alice.t@example.com',
    class: '10th Grade',
    subjects: ['Math', 'Science'],
    totalBookings: 12,
    status: 'active',
    avatar: 'https://picsum.photos/seed/alice/100/100'
  },
  {
    id: 's2',
    name: 'Bob Smith',
    email: 'bob.s@example.com',
    class: '12th Grade',
    subjects: ['Physics', 'Chemistry'],
    totalBookings: 8,
    status: 'active',
    avatar: 'https://picsum.photos/seed/bob/100/100'
  },
  {
    id: 's3',
    name: 'Charlie Davis',
    email: 'charlie.d@example.com',
    class: '8th Grade',
    subjects: ['English'],
    totalBookings: 4,
    status: 'blocked',
    avatar: 'https://picsum.photos/seed/charlie/100/100'
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    studentId: 's1',
    tutorId: '1',
    studentName: 'Alice Thompson',
    tutorName: 'Dr. Sarah Wilson',
    subject: 'Mathematics',
    dateTime: '2024-03-31 14:00',
    status: 'confirmed'
  },
  {
    id: 'b2',
    studentId: 's2',
    tutorId: '2',
    studentName: 'Bob Smith',
    tutorName: 'James Miller',
    subject: 'History',
    dateTime: '2024-04-01 10:30',
    status: 'pending'
  },
  {
    id: 'b3',
    studentId: 's1',
    tutorId: '3',
    studentName: 'Alice Thompson',
    tutorName: 'Elena Rodriguez',
    subject: 'Spanish',
    dateTime: '2024-03-25 16:00',
    status: 'cancelled',
    cancellationReason: 'Tutor had a personal emergency'
  },
  {
    id: 'b4',
    studentId: 's2',
    tutorId: '1',
    studentName: 'Bob Smith',
    tutorName: 'Dr. Sarah Wilson',
    subject: 'Physics',
    dateTime: '2023-12-15 11:00',
    status: 'confirmed'
  },
  {
    id: 'b5',
    studentId: 's3',
    tutorId: '4',
    studentName: 'Charlie Davis',
    tutorName: 'Robert Chen',
    subject: 'Computer Science',
    dateTime: '2023-11-20 15:30',
    status: 'confirmed'
  }
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    tutorName: 'Dr. Sarah Wilson',
    amount: 450,
    status: 'paid',
    method: 'Bank',
    date: '2024-03-28'
  },
  {
    id: 'p2',
    tutorName: 'Elena Rodriguez',
    amount: 320,
    status: 'pending',
    method: 'UPI',
    date: '2024-03-29'
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    studentName: 'Alice Thompson',
    tutorName: 'Dr. Sarah Wilson',
    rating: 5,
    feedback: 'Excellent teaching style! Sarah made calculus so much easier to understand.',
    date: '2024-03-20'
  },
  {
    id: 'r2',
    studentName: 'Bob Smith',
    tutorName: 'Elena Rodriguez',
    rating: 4,
    feedback: 'Very patient and helpful with my Spanish pronunciation.',
    date: '2024-03-22'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'New Tutor Registration',
    message: 'James Miller has applied to be a tutor.',
    time: '2 hours ago',
    type: 'info',
    read: false
  },
  {
    id: 'n3',
    title: 'Booking Confirmed',
    message: 'Alice Thompson confirmed a booking with Dr. Sarah Wilson.',
    time: '1 day ago',
    type: 'success',
    read: true
  }
];
