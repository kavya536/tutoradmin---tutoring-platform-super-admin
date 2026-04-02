import * as React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Eye,
  FileText,
  Mail,
  Calendar,
  Award,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, Tabs, Table, Modal } from './UI';
import { Tutor } from '../types';

interface TutorsManagementProps {
  tutors: Tutor[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
}

export const TutorsManagement = ({ tutors, onApprove, onReject }: TutorsManagementProps) => {
  const [activeTab, setActiveTab] = React.useState('All');
  const [selectedTutor, setSelectedTutor] = React.useState<Tutor | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [rejectionModal, setRejectionModal] = React.useState<{ isOpen: boolean, tutorId: string }>({ isOpen: false, tutorId: '' });
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const filteredTutors = tutors.filter(t => {
    const matchesTab = activeTab === 'All' || t.status === activeTab.toLowerCase().replace(' approval', '');
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionModal.tutorId, rejectionReason);
      setRejectionModal({ isOpen: false, tutorId: '' });
      setRejectionReason('');
      setSelectedTutor(null);
    }
  };

  const handleMessageTutor = (tutor: Tutor) => {
    setToast(`Message sent to ${tutor.name}`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleMenuAction = (action: string, tutor: Tutor) => {
    setToast(`${action} for ${tutor.name}`);
    setTimeout(() => setToast(null), 3000);
    setOpenMenuId(null);
  };

  const tabs = ['All', 'Pending Approval', 'Approved', 'Rejected'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tutors Management</h2>
          <p className="text-gray-500 font-medium">Review applications and manage existing tutors.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search tutors..." 
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
        <Table headers={['Name', 'Subjects', 'Experience', 'Status', 'Actions']}>
          <AnimatePresence mode="popLayout">
            {filteredTutors.map((tutor, index) => (
              <motion.tr 
                key={tutor.id} 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                layout
                className="hover:bg-gray-50/80 transition-all group cursor-default border-b border-gray-100 last:border-0"
              >
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-3">
                  <img src={tutor.avatar} alt={tutor.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{tutor.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{tutor.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-wrap gap-1">
                  {tutor.subjects.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-secondary text-primary text-[10px] font-bold rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-bold text-gray-700">
                {tutor.experience}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <Badge variant={tutor.status === 'approved' ? 'success' : tutor.status === 'pending' ? 'warning' : 'danger'}>
                  {tutor.status}
                </Badge>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTutor(tutor)}>
                    <Eye size={18} />
                  </Button>
                  {tutor.status === 'pending' && (
                    <>
                      <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50" onClick={() => onApprove(tutor.id)}>
                        <CheckCircle2 size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setRejectionModal({ isOpen: true, tutorId: tutor.id })}>
                        <XCircle size={18} />
                      </Button>
                    </>
                  )}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-bold text-xs"
                      onClick={() => setOpenMenuId(openMenuId === tutor.id ? null : tutor.id)}
                    >
                      Actions
                      <MoreVertical size={14} className="ml-1" />
                    </Button>
                    
                    <AnimatePresence>
                      {openMenuId === tutor.id && (
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
                              onClick={() => { setSelectedTutor(tutor); setOpenMenuId(null); }}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <Eye size={14} />
                              <span>View Profile</span>
                            </button>
                            <button 
                              onClick={() => handleMenuAction('Messaging', tutor)}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <Mail size={14} />
                              <span>Message Tutor</span>
                            </button>
                            <button 
                              onClick={() => handleMenuAction('Viewing Documents', tutor)}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <FileText size={14} />
                              <span>View Documents</span>
                            </button>
                            {tutor.status === 'pending' && (
                              <>
                                <div className="h-px bg-gray-100 my-1" />
                                <button 
                                  onClick={() => { onApprove(tutor.id); setOpenMenuId(null); }}
                                  className="w-full px-4 py-2 text-left text-sm font-bold text-green-600 hover:bg-green-50 flex items-center space-x-2 transition-colors"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Approve</span>
                                </button>
                                <button 
                                  onClick={() => { setRejectionModal({ isOpen: true, tutorId: tutor.id }); setOpenMenuId(null); }}
                                  className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                                >
                                  <XCircle size={14} />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
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
        {filteredTutors.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-bold">No tutors found matching your criteria.</p>
          </div>
        )}
      </Card>

      {/* Tutor Details Modal */}
      <Modal 
        isOpen={!!selectedTutor} 
        onClose={() => setSelectedTutor(null)} 
        title="Tutor Profile Details"
      >
        {selectedTutor && (
          <div className="space-y-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <img src={selectedTutor.avatar} alt={selectedTutor.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-50 shadow-lg" />
                <div>
                  <h4 className="text-2xl font-black text-gray-900 tracking-tight">{selectedTutor.name}</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-sm text-gray-500 font-medium">
                      <Mail size={14} className="mr-1.5" />
                      {selectedTutor.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 font-medium">
                      <Calendar size={14} className="mr-1.5" />
                      Joined {selectedTutor.joinedDate}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge variant={selectedTutor.status === 'approved' ? 'success' : selectedTutor.status === 'pending' ? 'warning' : 'danger'}>
                      {selectedTutor.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {selectedTutor.status === 'pending' && (
                  <>
                    <Button className="w-full" onClick={() => { onApprove(selectedTutor.id); setSelectedTutor(null); }}>Approve Tutor</Button>
                    <Button variant="danger" className="w-full" onClick={() => setRejectionModal({ isOpen: true, tutorId: selectedTutor.id })}>Reject Application</Button>
                  </>
                )}
                <Button variant="outline" className="w-full" onClick={() => handleMessageTutor(selectedTutor)}>Message Tutor</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Professional Bio</h5>
                  <p className="text-gray-700 leading-relaxed font-medium">{selectedTutor.bio}</p>
                </div>
                <div>
                  <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Specializations</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTutor.subjects.map(s => (
                      <div key={s} className="flex items-center px-3 py-1 bg-secondary text-primary rounded-lg font-bold text-sm">
                        <Award size={14} className="mr-2" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">KYC Documents</h5>
                  <div className="space-y-3">
                    {selectedTutor.documents.map(doc => (
                      <div key={doc.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-lg text-gray-400">
                            <FileText size={20} />
                          </div>
                          <span className="text-sm font-bold text-gray-700">{doc.name}</span>
                        </div>
                        <Badge variant={doc.status === 'verified' ? 'success' : 'warning'}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">Experience</span>
                    <span className="text-xl font-black text-primary">{selectedTutor.experience}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, tutorId: '' })}
        title="Reject Tutor Application"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-bold">
            Please provide a detailed reason for rejecting this application.
          </p>
          <p className="text-xs text-gray-500 font-medium">
            This message will be sent directly to the tutor's email address ({tutors.find(t => t.id === rejectionModal.tutorId)?.email}).
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 outline-none transition-all resize-none"
          />
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setRejectionModal({ isOpen: false, tutorId: '' })}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} disabled={!rejectionReason.trim()}>
              Send Rejection Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-[100] font-bold text-sm flex items-center space-x-3"
          >
            <span>{toast}</span>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <XCircle size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
