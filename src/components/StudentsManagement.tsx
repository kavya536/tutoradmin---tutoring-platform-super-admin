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
  ShieldCheck
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
  const [searchQuery, setSearchQuery] = React.useState('');
  const [symbolName, setSymbolName] = React.useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

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
        <Table headers={['Student', 'Class', 'Subjects', 'Bookings', 'Status', 'Actions']}>
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
                  {(student.subjects || []).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md">
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
        onClose={() => setSelectedStudent(null)} 
        title="Student Profile"
      >
        {selectedStudent && (
          <div className="space-y-8">
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gray-50 border-0">
                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Learning Profile</h5>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Interested Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedStudent.subjects || []).map(s => (
                        <span key={s} className="px-3 py-1 bg-white text-blue-600 rounded-lg font-bold text-sm shadow-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Total Bookings</p>
                      <p className="text-2xl font-black text-gray-900">{selectedStudent.totalBookings}</p>
                    </div>
                    <Badge variant={selectedStudent.status === 'active' ? 'success' : 'danger'}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Activity</h5>
                <Card className="p-4 bg-gray-50 border-0 max-h-72 overflow-y-auto">
                  {getStudentActivity(selectedStudent).length > 0 ? (
                    <div className="space-y-3">
                      {getStudentActivity(selectedStudent).map((activity: any) => (
                        <div key={activity.id} className="p-3 bg-white rounded-xl border border-gray-100">
                          <p className="text-sm font-bold text-gray-900">
                            {activity.subject || 'Session'} with {activity.tutorName || 'Tutor'}
                          </p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              {formatBookingDate(activity)}
                            </span>
                            <Badge variant={activity.status === 'confirmed' || activity.status === 'completed' ? 'success' : activity.status === 'cancelled' ? 'danger' : 'warning'}>
                              {activity.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 font-medium">No activity found for this student yet.</p>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
