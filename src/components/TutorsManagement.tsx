import * as React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Mail,
  Calendar,
  Award,
  Users,
  Video,
  Image,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  Download,
  Phone,
  User,
  ChevronRight,
  Info,
  Loader2,
  AlertTriangle,
  ChevronDown,
  AlertCircle,
  Eye,
  UserX,
  RotateCcw,
  RefreshCw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Card, Badge, Button, Tabs, Table, Modal } from './UI';
import { Tutor, Student, Booking } from '../types';
import { storage } from '../firebase';
import { ref, getDownloadURL, getBlob } from 'firebase/storage';

interface TutorsManagementProps {
  tutors: Tutor[];
  students: Student[];
  bookings: Booking[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onResendEmail: (id: string) => void;
  onToggleBlock: (id: string, currentStatus: string) => void;
  initialSelectedTutorId?: string | null;
}

// 🔥 INTERNAL PDF RENDERER (Bypasses Google/Microsoft viewer errors)
const PDFRenderer = ({ url, onLoading }: { url: string, onLoading: (loading: boolean) => void }) => {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pdf, setPdf] = React.useState<any>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const loadPdf = async () => {
      try {
        onLoading(true);
        if (!(window as any).pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          document.head.appendChild(script);
          await new Promise(resolve => script.onload = resolve);
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        if (url.includes('localhost')) {
          setError(true);
          onLoading(false);
          return;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        const data = await response.arrayBuffer();
        
        if (data.byteLength === 0) {
          setError(true);
          onLoading(false);
          return;
        }

        const loadingTask = (window as any).pdfjsLib.getDocument({ data });
        const pdfDoc = await loadingTask.promise;
        if (isMounted) {
          setPdf(pdfDoc);
          setNumPages(pdfDoc.numPages);
          onLoading(false);
        }
      } catch (err) {
        console.error("PDF.js load error:", err);
        if (isMounted) {
          setError(true);
          onLoading(false);
        }
      }
    };
    loadPdf();
    return () => { isMounted = false; };
  }, [url]);

  if (error) return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[500px] relative bg-slate-50 rounded-xl overflow-hidden border border-gray-100 shadow-inner flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
          <AlertTriangle size={32} />
        </div>
        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2">Document Unreachable</h4>
        <p className="text-xs text-gray-500 font-medium max-w-xs leading-relaxed">
          The document link is invalid or the file is missing from the server. This often happens with older 'localhost' registrations.
        </p>
        
        {url.includes('localhost') ? (
           <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[10px] font-bold text-amber-800 text-left">
             <p className="flex items-center gap-2 mb-1"><Info size={12}/> SYSTEM NOTE:</p>
             This file is stored on the tutor's local machine and cannot be accessed from your dashboard.
           </div>
        ) : (
          <iframe 
            src={`${url}#toolbar=0&view=FitH`} 
            className="w-full h-full border-none absolute inset-0"
            title="PDF Fallback Viewer"
          />
        )}
        <div className="absolute top-2 right-2 bg-amber-500 text-white text-[8px] font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1 uppercase tracking-widest">
          <AlertCircle size={10} /> Browser Native View
        </div>
      </div>
      <div className="p-4 text-center bg-gray-50/50 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest"> custom renderer failed • displaying native preview instead </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 rounded-xl text-[10px] font-bold h-8 px-4"
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink size={12} className="mr-2" />
          Open Full Document in New Tab
        </Button>
      </div>
    </div>
  );
  if (!pdf) return null;

  return (
    <div className="space-y-4">
      {Array.from({ length: numPages }, (_, i) => (
        <PDFPage key={i} pdf={pdf} pageNum={i + 1} />
      ))}
    </div>
  );
};

const PDFPage = ({ pdf, pageNum }: { pdf: any, pageNum: number }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
      }
    };
    renderPage();
  }, [pdf, pageNum]);

  return (
    <div className="relative group/page shadow-xl rounded-lg overflow-hidden bg-white border border-gray-100">
      <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/page:opacity-100 transition-opacity">
        Page {pageNum}
      </div>
      <canvas ref={canvasRef} className="w-full h-auto object-contain" />
    </div>
  );
};

// Helper Component for Verification Cards
interface VerificationCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  url: string;
  type: 'image' | 'pdf' | 'video';
  onViewFull: (data: { url: string, title: string }) => void;
}

const VerificationCard = ({ title, subtitle, icon, url: initialUrl, type, onViewFull }: VerificationCardProps) => {
  const [url, setUrl] = React.useState(initialUrl);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const isLocalPath = typeof initialUrl === 'string' && initialUrl.startsWith('/');
    const isFullUrl = typeof initialUrl === 'string' && initialUrl.startsWith('http');
    
    if (initialUrl && !isFullUrl && !isLocalPath && initialUrl.includes('/')) {
      setLoading(true);
      const storageRef = ref(storage, initialUrl);
      getDownloadURL(storageRef)
        .then((resolvedUrl) => {
          setUrl(resolvedUrl);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to resolve storage path:", initialUrl, err);
          setError(true);
          setLoading(false);
        });
    } else {
      setUrl(initialUrl);
      setError(!initialUrl);
      setLoading(false);
    }
  }, [initialUrl]);

  const isPDF = typeof url === 'string' && (
    type === 'pdf' || 
    url.toLowerCase().includes('.pdf') || 
    url.toLowerCase().includes('pdf') || 
    (url.includes('firebasestorage') && !url.toLowerCase().includes('.jpg') && !url.toLowerCase().includes('.jpeg') && !url.toLowerCase().includes('.png') && !url.toLowerCase().includes('.webp') && !url.toLowerCase().includes('.gif'))
  );

  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    setBlobUrl(url);
  }, [url]);

  return (
    <div className={cn(
      "group bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-300",
      url ? "hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5" : "opacity-60 bg-gray-50/50"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-gray-50 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {icon}
          </div>
          <div className="text-left">
            <h6 className="text-xs font-black text-gray-900 leading-tight">{title}</h6>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.05em]">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {url && (
            <button 
              onClick={() => {
                onViewFull({ url: url, title: title });
              }}
              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-gray-100 shadow-sm"
              title="View Full Document (All Pages)"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 h-56 flex items-center justify-center relative bg-gray-50/20">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolving Link...</p>
          </div>
        ) : error || !url ? (
          <div className="flex flex-col items-center gap-2 text-center p-6">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {error ? 'File Unreachable' : 'Document Not Provided'}
            </p>
            {initialUrl && (
              <div className="mt-2 p-2 bg-white/50 rounded-lg border border-amber-100 select-all">
                <p className="text-[8px] font-mono text-gray-400 break-all leading-relaxed">
                  Raw Data: {initialUrl}
                </p>
              </div>
            )}
          </div>
        ) : type === 'video' ? (
          <div className="w-full h-full rounded-xl overflow-hidden bg-black">
            <video 
              src={url} 
              className="w-full h-full object-contain"
              controls
              onError={() => setError(true)}
            />
          </div>
        ) : isPDF ? (
          <div className="w-full h-full flex flex-col pt-3">
             <div className="flex justify-between items-center px-4 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Badge variant="info" className="text-[8px] py-0 h-4 bg-primary/5 text-primary border-primary/10 tracking-widest px-2 uppercase">Multi-page Doc</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px] px-3 font-bold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    onClick={() => onViewFull({ url: blobUrl || url, title: title })}
                  >
                    <Eye size={12} className="mr-1" />
                    View Document
                  </Button>
                </div>
             </div>

            <div className="w-full flex-1 bg-gray-900/5 overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth">
              {(() => {
                const isCloudinary = url.includes('cloudinary') && url.includes('/upload/');
                if (isPDF && !isCloudinary) {
                  return <PDFRenderer url={url} onLoading={setLoading} />;
                }
                return [1, 2, 3, 4, 5].map((page) => (
                  <div key={page} className="relative group/page shadow-xl rounded-lg overflow-hidden bg-white">
                    <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/page:opacity-100 transition-opacity">
                      Page {page}
                    </div>
                    <img 
                      src={url.includes('cloudinary') && url.includes('/upload/')
                        ? url.replace('/upload/', `/upload/pg_${page},q_auto,f_auto/`).replace(/\.pdf$/i, '.jpg')
                        : url
                      }
                      alt={`Document Page ${page}`} 
                      className="w-full h-auto object-contain transition-transform duration-500 hover:scale-[1.01]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).closest('.relative')?.remove();
                      }}
                    />
                  </div>
                ));
              })()}
              
              <div className="py-8 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• End of Document •</p>
              </div>
            </div>
            
            <div className="p-2 px-4 bg-white border-t border-gray-100 flex justify-end items-center">
               <span className="text-[9px] font-black text-primary/10 uppercase tracking-tighter">Verified Link</span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full cursor-zoom-in group-hover:scale-[1.02] transition-transform duration-500">
            <img 
              src={url} 
              alt={title} 
              className="w-full h-full object-contain rounded-xl"
              onClick={() => window.open(url, '_blank')}
              onError={() => setError(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const TutorsManagement = ({ 
  tutors, 
  students, 
  bookings, 
  onApprove, 
  onReject,
  onResendEmail,
  onToggleBlock,
  initialSelectedTutorId = null
}: TutorsManagementProps) => {
  const [activeTab, setActiveTab] = React.useState('All');
  const [selectedTutorId, setSelectedTutorId] = React.useState<string | null>(initialSelectedTutorId);
  const [verifyingTutorId, setVerifyingTutorId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [rejectionModal, setRejectionModal] = React.useState<{ isOpen: boolean, tutorId: string }>({ isOpen: false, tutorId: '' });
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [modalTab, setModalTab] = React.useState<'profile' | 'history'>('profile');
  const [isLoading, setIsLoading] = React.useState(false);
  const [fullViewDoc, setFullViewDoc] = React.useState<{ url: string, title: string } | null>(null);

  React.useEffect(() => {
    if (initialSelectedTutorId) {
      setSelectedTutorId(initialSelectedTutorId);
    }
  }, [initialSelectedTutorId]);

  const filteredTutors = (tutors || []).filter(t => {
    const matchesTab = activeTab === 'All' || t.status === activeTab.toLowerCase().replace(' approval', '');
    const matchesSearch = (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAction = async (action: 'approve' | 'reject', id: string, reason?: string) => {
    try {
      setIsLoading(true);
      if (action === 'approve') {
        await onApprove(id);
      } else {
        await onReject(id, reason);
      }
    } catch (err: any) {
      console.error("❌ Action Error:", err);
      // Don't set success toast if there's an error
    } finally {
      setIsLoading(false);
      setOpenMenuId(null);
      setSelectedTutorId(null);
      setVerifyingTutorId(null);
    }
  };

  const selectedTutor = tutors.find(t => t.id === selectedTutorId);
  const verifyingTutor = tutors.find(t => t.id === verifyingTutorId);

  const handleReject = () => {
    if (rejectionReason.trim()) {
      handleAction('reject', rejectionModal.tutorId, rejectionReason);
      setRejectionModal({ isOpen: false, tutorId: '' });
      setRejectionReason('');
    }
  };

  const tabs = ['All', 'Pending Approval', 'Approved', 'Rejected'];

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3, ease: 'easeOut' as const }
    },
  };

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
    },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.1 } }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
      >
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Tutor Management
            <div className="px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-full border border-primary/10">
              {tutors.length} Total
            </div>
          </h2>
          <p className="text-gray-500 font-medium mt-1">Verify credentials, review profiles, and manage tutor status.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all w-full md:w-72"
            />
          </div>
        </div>
      </motion.div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Main List */}
      <Card className="border-none shadow-xl shadow-gray-100/50 relative z-0">
        <div className="overflow-visible pb-32">
          <Table headers={['Tutor details', 'Expertise', 'Active Bookings', 'Registered On', 'Status', 'Actions']} className="overflow-visible">
          <AnimatePresence mode="popLayout">
            {filteredTutors.map((tutor) => (
              <motion.tr 
                key={tutor.id} 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.98 }}
                layout
                className={cn(
                  "hover:bg-gray-50/50 transition-all border-b border-gray-50 last:border-0 relative",
                  openMenuId === tutor.id ? "z-50" : "z-0"
                )}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img 
                        src={tutor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=f0f4ff&color=0047ab&bold=true`} 
                        alt={tutor.name} 
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-md group-hover:scale-105 transition-transform" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=f0f4ff&color=0047ab&bold=true`;
                        }}
                      />
                      {tutor.status === 'approved' && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                          <CheckCircle2 size={10} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-black text-gray-900 leading-none">{tutor.name}</p>
                        {tutor.rejectionCount && tutor.rejectionCount > 0 && (
                          <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter flex items-center gap-1 animate-pulse" title={tutor.reAppliedAt ? `Last re-applied on: ${new Date(tutor.reAppliedAt).toLocaleString()}` : ''}>
                            <RefreshCw size={8} /> Re-applied {tutor.reAppliedAt && `(${new Date(tutor.reAppliedAt).toLocaleDateString()})`}
                          </span>
                        )}
                        {/* Document Presence Indicator */}
                        <div className="flex gap-0.5">
                          {(tutor.documents?.identityProof || tutor.identityProof || tutor.identityPic || tutor.identityURL) && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="ID Proof Present" />}
                          {(tutor.documents?.degreeCertificate || tutor.degreeCertificate || tutor.educationCert || tutor.degreeURL) && <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Degree Present" />}
                          {(tutor.documents?.experienceCertificate || tutor.experienceCertificate || tutor.experienceCert || tutor.certURL) && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Exp Cert Present" />}
                          {(tutor.documents?.demoVideo || tutor.demoVideo || tutor.videoURL) && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Video Present" />}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                          <Mail size={12} /> {tutor.email}
                        </span>
                        {tutor.phone && (
                          <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                            <Phone size={12} /> {tutor.phone}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 mt-0.5">
                          <Calendar size={10} /> {tutor.createdAt ? (tutor.createdAt.toDate ? tutor.createdAt.toDate().toLocaleDateString() : new Date(tutor.createdAt).toLocaleDateString()) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(tutor.subjects) && tutor.subjects.length > 0 ? (
                        tutor.subjects.slice(0, 2).map((s, idx) => (
                          <span key={`${s}-${idx}`} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-black rounded-md uppercase tracking-tight border border-primary/10">{s}</span>
                        ))
                      ) : typeof tutor.subjects === 'string' ? (
                        <span className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-black rounded-md uppercase tracking-tight border border-primary/10">{tutor.subjects}</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-black rounded-md uppercase tracking-tight">{tutor.qualification || 'No Subject'}</span>
                      )}
                      {Array.isArray(tutor.subjects) && tutor.subjects.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-md">+{tutor.subjects.length - 2}</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{tutor.experience} Experience</p>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-black rounded-full border border-blue-100">
                      {bookings.filter(b => b.tutorName === tutor.name).length}
                    </span>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">Students</p>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    {tutor.createdAt ? (tutor.createdAt.toDate ? tutor.createdAt.toDate().toLocaleString() : new Date(tutor.createdAt).toLocaleString()) : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <Badge variant={tutor.status === 'approved' ? 'success' : tutor.status === 'pending' ? 'warning' : 'danger'}>
                    {tutor.status}
                  </Badge>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "rounded-full hover:bg-gray-100 transition-all",
                          openMenuId === tutor.id ? "bg-gray-100 ring-4 ring-gray-50 text-primary" : "text-gray-400"
                        )}
                        onClick={() => setOpenMenuId(openMenuId === tutor.id ? null : tutor.id)}
                      >
                        <MoreVertical size={20} />
                      </Button>
                      
                      <AnimatePresence>
                        {openMenuId === tutor.id && (
                          <>
                            {/* Backdrop to close menu */}
                            <div 
                              className="fixed inset-0 z-[90]" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            
                            <motion.div 
                              variants={menuVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 py-2.5 z-[100] ring-1 ring-black/[0.05] overflow-hidden"
                            >
                                <button 
                                  onClick={() => { setSelectedTutorId(tutor.id); setOpenMenuId(null); }}
                                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                  <User size={16} className="text-gray-400" />
                                  View Profile
                                </button>
                                <button 
                                  onClick={() => { setVerifyingTutorId(tutor.id); setOpenMenuId(null); }}
                                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                  <ShieldCheck size={16} className="text-gray-400" />
                                  Verify Credentials
                                </button>
                                <div className="h-px bg-gray-50 my-1.5" />
                                <button 
                                  onClick={() => handleAction('approve', tutor.id)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed font-black transition-colors"
                                  disabled={tutor.status === 'approved' || isLoading}
                                >
                                  <CheckCircle2 size={16} />
                                  Approve Tutor
                                </button>
                                <button 
                                  onClick={() => { setRejectionModal({ isOpen: true, tutorId: tutor.id }); setOpenMenuId(null); }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed font-black transition-colors"
                                  disabled={tutor.status === 'rejected' || isLoading}
                                >
                                  <XCircle size={16} />
                                  Reject Tutor
                                </button>
                                <div className="h-px bg-gray-50 my-1.5" />
                                <button 
                                  onClick={() => { onToggleBlock(tutor.id, tutor.status || 'pending'); setOpenMenuId(null); }}
                                  className={cn(
                                    "w-full px-4 py-2.5 text-left text-sm font-black flex items-center gap-3 transition-colors",
                                    (tutor.status || 'pending') === 'blocked' ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50"
                                  )}
                                >
                                  {(tutor.status || 'pending') === 'blocked' ? (
                                    <>
                                      <ShieldCheck size={16} />
                                      Unblock Tutor
                                    </>
                                  ) : (
                                    <>
                                      <UserX size={16} />
                                      Block Tutor
                                    </>
                                  )}
                                </button>
                                {tutor.status !== 'pending' && (
                                  <>
                                    <div className="h-px bg-gray-50 my-1.5" />
                                    <button 
                                      onClick={() => { onResendEmail(tutor.id); setOpenMenuId(null); }}
                                      className="w-full px-4 py-2.5 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 font-black transition-colors"
                                      disabled={isLoading}
                                    >
                                      <Mail size={16} /> 
                                      Resend Notification
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
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-200">
              <Users size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No tutors found</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">Try adjusting your search filters to find what you're looking for.</p>
          </div>
        )}
        </div>
      </Card>

      {/* Profile Modal */}
      <Modal 
        isOpen={!!selectedTutorId} 
        onClose={() => { setSelectedTutorId(null); setModalTab('profile'); }} 
        title={`${selectedTutor?.name || 'Tutor'} Profile & History`}
      >
        {selectedTutor && (
          <div className="space-y-8 pb-4">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-100 mb-6">
              <button 
                onClick={() => setModalTab('profile')}
                className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${modalTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
              >
                Profile Overview
              </button>
              <button 
                onClick={() => setModalTab('history')}
                className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${modalTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
              >
                Student Ledger & History
              </button>
            </div>

            {modalTab === 'profile' ? (
              <>
            {/* Header Info */}
            <div className="flex items-start justify-between bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
              <div className="flex items-center space-x-6">
                <img 
                  src={selectedTutor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTutor.name)}&background=0047ab&color=fff&size=200`} 
                  alt={selectedTutor.name} 
                  className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white shadow-xl" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTutor.name)}&background=0047ab&color=fff&size=200`;
                  }}
                />
                <div>
                  <h4 className="text-2xl font-black text-gray-900 tracking-tight">{selectedTutor.name}</h4>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center text-sm text-gray-500 font-bold">
                      <Mail size={14} className="mr-2 text-primary" />
                      {selectedTutor.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 font-bold">
                      <Phone size={14} className="mr-2 text-primary" />
                      {selectedTutor.phone || 'No phone'}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Badge variant={selectedTutor.status === 'approved' ? 'success' : selectedTutor.status === 'pending' ? 'warning' : 'danger'}>
                      {selectedTutor.status}
                    </Badge>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center">
                      <Calendar size={12} className="mr-1.5" />
                      Joined {selectedTutor.registrationDate ? new Date(selectedTutor.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : selectedTutor.joinedDate || 'Recently'}
                    </span>
                  </div>
                  {selectedTutor.upiId && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-2xl border border-primary/10 inline-flex flex-col gap-1">
                      <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Tutor UPI ID</span>
                      <span className="text-xs font-black text-primary font-mono">{selectedTutor.upiId}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  className="rounded-xl shadow-lg shadow-primary/20" 
                  onClick={() => handleAction('approve', selectedTutor.id)}
                  disabled={isLoading || selectedTutor.status === 'approved'}
                >
                  {selectedTutor.status === 'approved' ? 'Approved' : 'Approve'}
                </Button>
                <Button 
                  variant="danger" 
                  className="rounded-xl" 
                  onClick={() => handleAction('reject', selectedTutor.id)}
                  disabled={isLoading || selectedTutor.status === 'rejected'}
                >
                  {selectedTutor.status === 'rejected' ? 'Rejected' : 'Reject'}
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl"
                  onClick={() => setVerifyingTutorId(selectedTutor.id)}
                >
                  Verify Documents
                </Button>
                <div className="h-px bg-gray-100 my-1" />
                <Button 
                  variant={selectedTutor.status === 'blocked' ? 'success' : 'danger'}
                  className="rounded-xl flex items-center justify-center gap-2" 
                  onClick={() => onToggleBlock(selectedTutor.id, selectedTutor.status || 'pending')}
                  disabled={isLoading}
                >
                  {selectedTutor.status === 'blocked' ? (
                    <>
                      <ShieldCheck size={16} />
                      Unblock Tutor
                    </>
                  ) : (
                    <>
                      <UserX size={16} />
                      Block Tutor
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Professional Section */}
              <div className="space-y-6">
                <div>
                  <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <GraduationCap size={14} /> Professional Details
                  </h5>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Experience</span>
                      <span className="text-sm font-black text-gray-900">{selectedTutor.experience}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Highest Degree</span>
                      <span className="text-sm font-black text-gray-900">{selectedTutor.qualification || 'N/A'}</span>
                    </div>
                    {selectedTutor.targetClasses && (
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Target Classes</span>
                        <span className="text-sm font-black text-slate-900 leading-tight text-right max-w-[150px]">{selectedTutor.targetClasses}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Award size={14} /> Subjects & Expertise
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedTutor.subjects) && selectedTutor.subjects.length > 0 ? (
                      selectedTutor.subjects.map(s => (
                        <div key={s} className="px-4 py-2 bg-primary/5 text-primary rounded-xl font-black text-xs uppercase tracking-tight border border-primary/10">
                          {s}
                        </div>
                      ))
                    ) : typeof selectedTutor.subjects === 'string' ? (
                      <div className="px-4 py-2 bg-primary/5 text-primary rounded-xl font-black text-xs uppercase tracking-tight border border-primary/10">
                        {selectedTutor.subjects}
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl font-black text-xs uppercase tracking-tight">
                        {selectedTutor.qualification || 'General Tutoring'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio & About */}
              <div className="md:col-span-2">
                <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <User size={14} /> About Tutor & Documents
                </h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 min-h-[200px]">
                    <p className="text-gray-700 leading-relaxed font-medium">
                      {selectedTutor.bio || "No professional bio provided by the tutor."}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <VerificationCard 
                      title="Identity Proof"
                      subtitle="Aadhaar / PAN Card"
                      icon={<Image size={18} />}
                      url={selectedTutor.identityPic || selectedTutor.documents?.identityProof || selectedTutor.identityProof || selectedTutor.identityURL || selectedTutor.idCard || selectedTutor.aadharURL || ''}
                      type="image"
                      onViewFull={setFullViewDoc}
                    />
                    <VerificationCard 
                      title="Degree Certificate"
                      subtitle="Academic Qualification"
                      icon={<GraduationCap size={18} />}
                      url={selectedTutor.educationCert || selectedTutor.documents?.degreeCertificate || selectedTutor.degreeCertificate || selectedTutor.degreeURL || selectedTutor.qualificationDoc || selectedTutor.educationURL || ''}
                      type="pdf"
                      onViewFull={setFullViewDoc}
                    />
                    {(selectedTutor.experienceCert || selectedTutor.documents?.experienceCertificate || selectedTutor.experienceCertificate || selectedTutor.certificate || selectedTutor.certURL || selectedTutor.expDoc || selectedTutor.expURL) && (
                      <VerificationCard 
                        title="Experience Certificate"
                        subtitle="Professional Records"
                        icon={<Award size={18} />}
                        url={selectedTutor.experienceCert || selectedTutor.documents?.experienceCertificate || selectedTutor.experienceCertificate || selectedTutor.certificate || selectedTutor.certURL || selectedTutor.expDoc || selectedTutor.expURL || ''}
                        type="pdf"
                        onViewFull={setFullViewDoc}
                      />
                    )}
                  </div>
                </div>

                {/* Video Support in Profile */}
                <div className="mt-8">
                  <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Video size={14} /> Teaching Demo Video
                  </h5>
                  {(selectedTutor.documents?.demoVideo || selectedTutor.demoVideo || selectedTutor.videoURL || selectedTutor.demoURL || selectedTutor.liveVideo) ? (
                    <div className="group relative rounded-3xl overflow-hidden bg-gray-900 border-4 border-gray-100 shadow-xl max-w-2xl">
                      <video 
                        src={selectedTutor.documents?.demoVideo || selectedTutor.demoVideo || selectedTutor.videoURL || selectedTutor.demoURL || selectedTutor.liveVideo}
                        className="w-full aspect-video object-contain"
                        controls
                      />
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                      <Video size={24} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No demo video available</p>
                    </div>
                  )}
                </div>

                {/* Moderation & Audit History */}
                {(selectedTutor.rejectionCount || 0) > 0 || (selectedTutor.approvalHistory && selectedTutor.approvalHistory.length > 0) ? (
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h5 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlertCircle size={14} /> Moderation & Audit History
                      </h5>
                      <div className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full border border-rose-100">
                        {selectedTutor.rejectionCount || 0} Rejections Recorded
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedTutor.approvalHistory?.slice().reverse().map((entry, idx) => (
                        <div key={idx} className={cn(
                          "p-4 rounded-2xl border transition-all",
                          entry.action === 'rejected' ? "bg-rose-50/30 border-rose-100" : "bg-emerald-50/30 border-emerald-100"
                        )}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {entry.action === 'rejected' ? <XCircle size={14} className="text-rose-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                entry.action === 'rejected' ? "text-rose-600" : "text-emerald-600"
                              )}>
                                {entry.action === 'rejected' ? 'Profile Rejected' : 'Profile Approved'}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase">
                              {entry.date} • {entry.time}
                            </span>
                          </div>
                          {entry.reason && (
                            <p className="text-xs font-medium text-gray-600 leading-relaxed italic">
                              " {entry.reason} "
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 p-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center">
                    <ShieldCheck size={20} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No prior moderation history found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Bookings Section */}
            <div className="pt-8 border-t border-gray-100">
              <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Users size={14} /> Student Bookings & Engagement
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.filter(b => b.tutorName === selectedTutor.name).length > 0 ? (
                  bookings
                    .filter(b => b.tutorName === selectedTutor.name)
                    .map((booking, idx) => {
                      const student = students.find(s => s.id === booking.studentId);
                      return (
                        <div key={booking.id || idx} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                          
                          <div className="flex items-center gap-3 mb-4 relative">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs uppercase">
                              {booking.studentName.slice(0, 2)}
                            </div>
                            <div>
                              <h6 className="text-[13px] font-black text-gray-900 leading-tight">{booking.studentName}</h6>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                Class {student?.class || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2.5 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</span>
                              <span className="text-[11px] font-black text-primary uppercase tracking-tight bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">{booking.subject}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</span>
                              <span className="text-[11px] font-bold text-gray-700">
                                {idx % 2 === 0 ? 'Monthly (30 Days)' : 'Quarterly (2 Months)'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                booking.status === 'confirmed' ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                              )}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="col-span-full py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 mb-4">
                      <Calendar size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-500">No active student bookings found for this tutor.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
              <div className="space-y-6">
                {/* Stats & UPI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Tutor UPI ID</p>
                    <p className="text-sm font-black text-primary font-mono">{selectedTutor.upiId || 'Not provided'}</p>
                    <p className="text-[9px] text-primary/40 font-bold mt-1">For payout processing</p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Students</p>
                    <p className="text-3xl font-black text-emerald-900">
                      {new Set(bookings.filter(b => b.tutorId === selectedTutor.id).map(b => b.studentId)).size}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payouts Done</p>
                    <p className="text-3xl font-black text-slate-900">
                      {bookings.filter(b => b.tutorId === selectedTutor.id && (b as any).tutorPayoutStatus === 'paid').length}
                    </p>
                  </div>
                </div>

                {/* Student History Table */}
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                   <div className="p-6 border-b border-gray-50">
                     <h5 className="text-xs font-black text-gray-900 uppercase tracking-widest">Active Students & Booking Records</h5>
                   </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject & Plan</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timings (Start-End)</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount & Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payout</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bookings
                          .filter(b => b.tutorId === selectedTutor.id)
                          .map((b: any) => (
                          <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-black text-gray-900">{b.studentName}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{b.studentEmail || 'Verified student'}</p>
                            </td>
                            <td className="px-6 py-4">
                               <div className="space-y-1">
                                 <p className="text-xs font-bold text-gray-700">{b.subject}</p>
                                 <Badge variant="default" className="text-[8px] py-0">{b.planName || b.studentType || 'General'}</Badge>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="space-y-1 text-gray-500">
                                 <p className="text-[10px] font-bold flex items-center gap-1.5 uppercase">
                                   <Calendar size={10} className="text-primary" /> {b.date || b.dateTime?.split(' ')[0]}
                                 </p>
                                 <p className="text-[9px] font-black flex items-center gap-1.5 uppercase tracking-tighter">
                                   <Clock size={10} className="text-primary" /> {b.startTime || b.time} - {b.endTime || 'N/A'}
                                 </p>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="space-y-1">
                                 <p className="text-sm font-black text-gray-900">₹{b.amount || 0}</p>
                                 <Badge variant={b.status === 'confirmed' || b.status === 'completed' ? 'success' : b.status === 'pending_cancellation' ? 'warning' : 'danger'}>
                                   {b.status === 'pending_cancellation' ? 'CLASS CANCEL REQUEST' : b.status}
                                 </Badge>
                                 {b.status === 'pending_cancellation' && (
                                   <div className="mt-2 p-2 bg-rose-50 rounded-lg border border-rose-100">
                                     <p className="text-[7px] font-black text-rose-600 uppercase tracking-tighter leading-none">Reason: {b.cancellationReason}</p>
                                     <p className="text-[6px] font-bold text-gray-400 uppercase mt-1">Rebooked: {b.bookedAnotherTutor ? 'Yes' : 'No'}</p>
                                   </div>
                                 )}
                                 {b.status === 'cancelled' && (
                                    <p className="text-[8px] font-black text-rose-500 uppercase mt-1">Refund: {b.refundStatus || 'Pending'}</p>
                                 )}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col items-center gap-1.5">
                                 <Badge variant={b.tutorPayoutStatus === 'paid' ? 'success' : 'warning'}>
                                   {b.tutorPayoutStatus || 'pending'}
                                 </Badge>
                                 {b.tutorPayoutDate && (
                                   <span className="text-[8px] text-gray-400 font-bold uppercase">{new Date(b.tutorPayoutDate).toLocaleDateString()}</span>
                                 )}
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {bookings.filter(b => b.tutorId === selectedTutor.id).length === 0 && (
                    <div className="p-20 text-center text-gray-300">
                       <p className="text-sm font-bold uppercase tracking-[0.2em]">No teaching records found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      }
      </Modal>

      {/* Verification Modal (CORE FEATURE) */}
      <Modal
        isOpen={!!verifyingTutorId}
        onClose={() => setVerifyingTutorId(null)}
        title="Verify Tutor Credentials"
        size="4xl"
      >
        {verifyingTutor && (
          <div className="space-y-8 px-1">
            <div className="flex items-center gap-4 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
              <Info size={20} className="shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                Please carefully review all uploaded documents and the demo video. 
                Ensure full compliance with Eduqra's teaching standards before approving.
              </p>
            </div>

            {/* Documents Section */}
            <div className="space-y-6">
              <h5 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Uploaded Documents
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ID PROOF */}
                <VerificationCard 
                  title="Identity Proof"
                  subtitle="Aadhaar / PAN Card"
                  icon={<Image size={18} />}
                  url={verifyingTutor.identityPic || verifyingTutor.documents?.identityProof || verifyingTutor.identityProof || verifyingTutor.identityURL || verifyingTutor.idCard || verifyingTutor.aadharURL || ''}
                  type="image"
                  onViewFull={setFullViewDoc}
                />
                {/* DEGREE */}
                <VerificationCard 
                  title="Degree Certificate"
                  subtitle="Educational Qualification"
                  icon={<GraduationCap size={18} />}
                  url={verifyingTutor.educationCert || verifyingTutor.documents?.degreeCertificate || verifyingTutor.degreeCertificate || verifyingTutor.degreeURL || verifyingTutor.qualificationDoc || verifyingTutor.educationURL || ''}
                  type="pdf"
                  onViewFull={setFullViewDoc}
                />
                {/* EXPERIENCE - Conditional render based on presence */}
                {(verifyingTutor.experienceCert || verifyingTutor.documents?.experienceCertificate || verifyingTutor.experienceCertificate || verifyingTutor.certificate || verifyingTutor.certURL || verifyingTutor.expDoc || verifyingTutor.expURL) ? (
                  <VerificationCard 
                    title="Experience Certificate"
                    subtitle="Professional Records"
                    icon={<Award size={18} />}
                    url={verifyingTutor.experienceCert || verifyingTutor.documents?.experienceCertificate || verifyingTutor.experienceCertificate || verifyingTutor.certificate || verifyingTutor.certURL || verifyingTutor.expDoc || verifyingTutor.expURL || ''}
                    type="pdf"
                    onViewFull={setFullViewDoc}
                  />
                ) : null}
              </div>
            </div>

            {/* Video Section */}
            <div className="space-y-6">
              <h5 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Video size={18} className="text-primary" />
                Teaching Demo Video
              </h5>
              
              {(verifyingTutor.documents?.demoVideo || verifyingTutor.demoVideo || verifyingTutor.videoURL || verifyingTutor.demoURL || verifyingTutor.liveVideo) ? (
                <div className="group relative rounded-3xl overflow-hidden bg-gray-900 border-4 border-gray-100 shadow-2xl">
                  <video 
                    src={verifyingTutor.documents?.demoVideo || verifyingTutor.demoVideo || verifyingTutor.videoURL || verifyingTutor.demoURL || verifyingTutor.liveVideo}
                    className="w-full aspect-video object-contain"
                    controls
                    poster="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&fit=crop"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={verifyingTutor.documents?.demoVideo || verifyingTutor.demoVideo || verifyingTutor.videoURL || verifyingTutor.demoURL || verifyingTutor.liveVideo} 
                      target="_blank" 
                      className="bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"
                    >
                      <ExternalLink size={14} /> Full Screen
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                  <Video size={32} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-sm font-black text-slate-600 uppercase tracking-tight">No teaching demo video provided</p>
                  <p className="text-xs text-slate-400 font-bold mt-1">Check the list below for any other detected links.</p>
                </div>
              )}
            </div>
            {/* Actions Footer */}
            <div className="sticky bottom-0 bg-white pt-6 pb-2 border-t border-gray-50 flex items-center justify-end gap-3 z-50">
                <Button 
                  variant="outline" 
                   onClick={() => setVerifyingTutorId(null)}
                   className="rounded-2xl border-gray-100 px-8"
                >
                  Cancel
                </Button>
                 <Button 
                   variant="danger" 
                   onClick={() => { setRejectionModal({ isOpen: true, tutorId: verifyingTutor.id }); setVerifyingTutorId(null); }}
                   className="rounded-2xl px-8"
                   disabled={isLoading || verifyingTutor.status === 'rejected'}
                 >
                   {verifyingTutor.status === 'rejected' ? 'Rejected' : 'Reject'}
                 </Button>
                <Button 
                  className="rounded-2xl px-12 shadow-xl shadow-primary/20"
                  onClick={() => handleAction('approve', verifyingTutor.id)}
                  disabled={isLoading || verifyingTutor.status === 'approved'}
                >
                  {verifyingTutor.status === 'approved' ? 'Approved' : 'Approve Profile'}
                </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* FULL SCREEN DOCUMENT VIEWER */}
      <Modal
        isOpen={!!fullViewDoc}
        onClose={() => setFullViewDoc(null)}
        title={`Full Document View: ${fullViewDoc?.title || ''}`}
        size="6xl"
      >
        <div className="bg-slate-900 -mx-6 -mb-6 p-4 md:p-10 min-h-[70vh] flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-6">
            {fullViewDoc && (
              (() => {
                const baseUrl = fullViewDoc.url;
                const isCloudinary = baseUrl.includes('cloudinary') && baseUrl.includes('/upload/');
                const isPdf = baseUrl.toLowerCase().includes('.pdf') || baseUrl.includes('pdf') || baseUrl.includes('firebasestorage');

                if (isPdf && !isCloudinary) {
                  return (
                    <div className="w-full h-[85vh] bg-white rounded-xl overflow-hidden shadow-2xl relative group p-4 overflow-y-auto custom-scrollbar">
                      <PDFRenderer url={baseUrl} onLoading={() => {}} />
                    </div>
                  );
                }

                return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((page) => {
                  let cleanBaseUrl = baseUrl;
                  if (cleanBaseUrl.includes('/upload/')) {
                    const parts = cleanBaseUrl.split('/upload/');
                    const pathSegments = parts[1].split('/');
                    const cleanSegments = pathSegments.filter(seg => 
                      !seg.includes(',') && !seg.startsWith('pg_') && !seg.startsWith('fl_') && seg !== 'pg_1'
                    );
                    cleanBaseUrl = `${parts[0]}/upload/${cleanSegments.join('/')}`;
                  }
                  
                  const pageUrl = cleanBaseUrl.includes('cloudinary')
                    ? cleanBaseUrl.replace('/upload/', `/upload/pg_${page},q_auto,f_auto/`).replace(/\.pdf$/i, '.jpg')
                    : cleanBaseUrl;

                  return (
                    <div key={page} className="relative bg-white shadow-2xl rounded-sm overflow-hidden min-h-[100px]">
                      <div className="absolute top-4 left-4 z-50 bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                        PAGE {page}
                      </div>
                      <img 
                        src={pageUrl}
                        alt={`Document Page ${page}`}
                        className="w-full h-auto object-contain block"
                        loading="lazy"
                        onError={(e) => {
                          const container = (e.target as HTMLElement).closest('.relative');
                          if (container) (container as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  );
                });
              })()
            )}
            
            <div className="py-12 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">End of Verified Document</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, tutorId: '' })}
        title="Application Rejection"
      >
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-4">
            <XCircle className="text-red-500 mt-1" size={24} />
            <div>
              <p className="text-sm font-black text-red-700 uppercase tracking-tight">Reason for rejection is mandatory</p>
              <p className="text-xs text-red-600/70 font-bold mt-0.5">The tutor will receive this feedback via email to help them improve their application.</p>
            </div>
          </div>

          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., ID proof is blurry, teaching demo lacks audio clarity, or certificates are missing..."
            className="w-full h-40 p-6 bg-gray-50 border border-transparent rounded-3xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 outline-none transition-all resize-none shadow-inner"
          />

          <div className="flex justify-end gap-3">
            <Button variant="ghost" className="rounded-xl" onClick={() => setRejectionModal({ isOpen: false, tutorId: '' })}>Close</Button>
            <Button 
              variant="danger" 
              className="rounded-xl px-8 shadow-lg shadow-red-500/20"
              onClick={handleReject} 
              disabled={!rejectionReason.trim() || isLoading}
            >
              Send Final Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


