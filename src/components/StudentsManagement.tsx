import * as React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Ban, 
  CheckCircle2,
  Mail,
  GraduationCap,
  Calendar,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, Table, Modal } from './UI';
import { Student } from '../types';

interface StudentsManagementProps {
  students: Student[];
  onToggleBlock: (id: string) => void;
}

export const StudentsManagement = ({ students, onToggleBlock }: StudentsManagementProps) => {
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
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

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10, filter: 'blur(4px)' },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0, 
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
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
            {filteredStudents.map((student, index) => (
              <motion.tr 
                key={student.id} 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                layout
                className="hover:bg-gray-50/80 transition-all group cursor-default border-b border-gray-100 last:border-0"
              >
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-3">
                  <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform" />
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
                  {student.subjects.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-gray-900">{student.totalBookings}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <Badge variant={student.status === 'active' ? 'success' : 'danger'}>
                  {student.status}
                </Badge>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(student)}>
                    <Eye size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={student.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}
                    onClick={() => {
                      if (student.status === 'active') {
                        setSymbolName('Block Student');
                      } else {
                        setSymbolName('Unblock Student');
                      }
                      onToggleBlock(student.id);
                    }}
                  >
                    {student.status === 'active' ? <Ban size={18} /> : <CheckCircle2 size={18} />}
                  </Button>
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                    >
                      <MoreVertical size={18} />
                    </Button>
                    
                    <AnimatePresence>
                      {openMenuId === student.id && (
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
                              onClick={() => { setSelectedStudent(student); setOpenMenuId(null); }}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <Eye size={14} />
                              <span>View Profile</span>
                            </button>
                            <button 
                              onClick={() => handleAction('Viewing Booking History', student.name)}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <Calendar size={14} />
                              <span>Booking History</span>
                            </button>
                            <button 
                              onClick={() => handleAction('Sending Notification', student.name)}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <Mail size={14} />
                              <span>Send Notification</span>
                            </button>
                            <div className="h-px bg-gray-100 my-1" />
                            <button 
                              onClick={() => { onToggleBlock(student.id); setOpenMenuId(null); }}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                            >
                              <Ban size={14} />
                              <span>{student.status === 'active' ? 'Block Account' : 'Unblock Account'}</span>
                            </button>
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

      {/* Symbol Name Toast/Modal */}
      <AnimatePresence>
        {symbolName && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-[100] font-bold text-sm flex items-center space-x-3"
          >
            <span>Action: {symbolName}</span>
            <button onClick={() => setSymbolName(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal 
        isOpen={!!selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
        title="Student Profile"
      >
        {selectedStudent && (
          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-50 shadow-lg" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gray-50 border-0">
                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Learning Profile</h5>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Interested Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.subjects.map(s => (
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
                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Quick Actions</h5>
                <Button 
                  variant={selectedStudent.status === 'active' ? 'danger' : 'primary'} 
                  className="w-full"
                  onClick={() => { onToggleBlock(selectedStudent.id); setSelectedStudent(null); }}
                >
                  {selectedStudent.status === 'active' ? 'Block Student Account' : 'Unblock Student Account'}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleAction('Viewing Booking History', selectedStudent.name)}>View Booking History</Button>
                <Button variant="outline" className="w-full" onClick={() => handleAction('Sending Notification', selectedStudent.name)}>Send Notification</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
