import * as React from 'react';
import { 
  Users, 
  UserRound, 
  CalendarCheck, 
  Star,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { Tutor, Student, Booking, Payment } from '../types';

const data = [
  { name: 'Mon', bookings: 40 },
  { name: 'Tue', bookings: 30 },
  { name: 'Wed', bookings: 20 },
  { name: 'Thu', bookings: 27 },
  { name: 'Fri', bookings: 18 },
  { name: 'Sat', bookings: 23 },
  { name: 'Sun', bookings: 34 },
];

const topTutors = [
  { name: 'Dr. Sarah Wilson', bookings: 124, color: '#005F63' },
  { name: 'Elena Rodriguez', bookings: 98, color: '#008B8B' },
  { name: 'James Miller', bookings: 76, color: '#20B2AA' },
  { name: 'Robert Chen', bookings: 45, color: '#48D1CC' },
];

interface DashboardProps {
  tutors: Tutor[];
  students: Student[];
  bookings: Booking[];
  payments: Payment[];
  setActivePage: (page: string) => void;
}

export const Dashboard = ({ tutors, students, bookings, setActivePage }: DashboardProps) => {
  const [dateRange, setDateRange] = React.useState<'30days' | 'all'>('all');
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);

  const filteredBookings = React.useMemo(() => {
    if (dateRange === 'all') return bookings;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return bookings.filter(b => new Date(b.dateTime) >= thirtyDaysAgo);
  }, [bookings, dateRange]);

  const stats = [
    { label: 'Total Tutors', value: tutors.length, icon: Users, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-50', page: 'tutors' },
    { label: 'Total Students', value: students.length, icon: UserRound, trend: '+5%', color: 'text-purple-600', bg: 'bg-purple-50', page: 'students' },
    { label: 'Total Bookings', value: filteredBookings.length, icon: CalendarCheck, trend: '+18%', color: 'text-green-600', bg: 'bg-green-50', page: 'bookings' },
    { label: 'Avg Rating', value: '4.8', icon: Star, trend: '+0.2', color: 'text-orange-600', bg: 'bg-orange-50', page: 'reviews' },
  ];

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
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-gray-500 font-medium mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <Button 
            variant={dateRange === '30days' ? 'primary' : 'outline'} 
            className="font-bold text-sm whitespace-nowrap"
            onClick={() => setDateRange('30days')}
          >
            <Clock size={16} className="mr-2" />
            Last 30 Days
          </Button>
          <Button 
            variant={dateRange === 'all' ? 'primary' : 'outline'} 
            className="font-bold text-sm whitespace-nowrap"
            onClick={() => setDateRange('all')}
          >
            <CalendarCheck size={16} className="mr-2" />
            All Time
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
          >
            <Card 
              className="p-6 lg:hover:shadow-2xl lg:hover:-translate-y-1 transition-all cursor-pointer group active:scale-95 border-b-4 border-transparent lg:hover:border-primary/20"
              onClick={() => setActivePage(stat.page)}
            >
              <div className="flex items-start justify-between">
                <div className={cn('p-3 rounded-xl transition-colors group-hover:scale-110 duration-300', stat.bg)}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <div className="flex items-center space-x-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <ArrowUpRight size={14} />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1 tracking-tight">{stat.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Bookings Trend</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-bold text-gray-500">Bookings</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBook" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005F63" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#005F63" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#005F63" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBook)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Top Performing Tutors</h3>
          <div className="space-y-6">
            {topTutors.map((tutor) => (
              <div key={tutor.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-700">{tutor.name}</span>
                  <span className="font-black text-primary">{tutor.bookings} bookings</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(tutor.bookings / 150) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: tutor.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-8 font-bold"
            onClick={() => setActivePage('reports')}
          >
            View Full Report
          </Button>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 gap-6"
      >
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Bookings</h3>
          <div className="space-y-4">
            {filteredBookings.slice(0, 6).map((booking) => (
              <div 
                key={booking.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group"
                onClick={() => {
                  const student = students.find(s => s.id === booking.studentId);
                  if (student) setSelectedStudent(student);
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <CalendarCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{booking.studentName} with {booking.tutorName}</p>
                    <p className="text-xs text-gray-500 font-medium">{booking.subject} • {booking.dateTime}</p>
                    {booking.status === 'cancelled' && booking.cancellationReason && (
                      <p className="text-xs text-red-500 font-bold mt-1 italic">Reason: {booking.cancellationReason}</p>
                    )}
                  </div>
                </div>
                <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'danger'}>
                  {booking.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm shadow-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-50 ml-[280px] lg:ml-0"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Student Profile</h3>
                  <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <XCircle size={24} className="text-red-500" />
                  </button>
                </div>
                
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-primary/10 shadow-lg">
                    <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight">{selectedStudent.name}</h4>
                    <p className="text-gray-500 font-medium">{selectedStudent.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedStudent.status === 'active' ? 'success' : 'danger'}>
                      {selectedStudent.status}
                    </Badge>
                    <Badge variant="default">{selectedStudent.class}</Badge>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bookings</p>
                    <p className="text-xl font-black text-gray-900 mt-1">{selectedStudent.totalBookings}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Subjects</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{selectedStudent.subjects.join(', ')}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <Button className="w-full font-bold shadow-xl shadow-primary/20" onClick={() => setSelectedStudent(null)}>Close Profile</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
