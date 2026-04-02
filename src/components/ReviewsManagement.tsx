import * as React from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp,
  Users,
  Clock,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button } from './UI';
import { Review } from '../types';
import { cn } from '../lib/utils';

interface ReviewsManagementProps {
  reviews: Review[];
  onDelete: (id: string) => void;
}

export const ReviewsManagement = ({ reviews, onDelete }: ReviewsManagementProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTutor, setSelectedTutor] = React.useState<string | null>(null);

  // Group reviews by tutor
  const reviewsByTutor = React.useMemo(() => {
    const grouped: Record<string, {
      tutorName: string;
      reviews: Review[];
      avgRating: number;
      successRate: number;
    }> = {};

    reviews.forEach(review => {
      // Ensure we use the exact tutor name from the review object
      const tName = review.tutorName;
      if (!grouped[tName]) {
        grouped[tName] = {
          tutorName: tName,
          reviews: [],
          avgRating: 0,
          successRate: 98 // Mocked for UI context
        };
      }
      grouped[tName].reviews.push(review);
    });

    Object.values(grouped).forEach(group => {
      group.avgRating = group.reviews.reduce((acc, r) => acc + r.rating, 0) / group.reviews.length;
      // Sort: Today's date (most recent) at the top
      group.reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return Object.values(grouped).filter(group => 
      group.tutorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reviews, searchQuery]);

  // Debug log to ensure state is changing correctly
  React.useEffect(() => {
    if (selectedTutor) {
      console.log("Selected Tutor set to:", selectedTutor);
    }
  }, [selectedTutor]);

  const activeTutorData = React.useMemo(() => {
    if (!selectedTutor) return null;
    return reviewsByTutor.find(t => t.tutorName === selectedTutor);
  }, [reviewsByTutor, selectedTutor]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <AnimatePresence mode="wait">
        {!selectedTutor ? (
          /* SECTION 1: GRID OF TUTOR BOXES */
          <motion.div 
            key="grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">Tutor Feedback Centers</h2>
                <p className="text-gray-500 font-medium mt-1">Select a tutor to manage their reputation statements.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search tutors..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all w-full md:w-64"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {reviewsByTutor.map((tutor) => (
                <motion.div
                  key={tutor.tutorName}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Card 
                    className="p-8 h-[340px] flex flex-col items-center text-center justify-between hover:shadow-2xl hover:shadow-primary/10 cursor-pointer border-gray-100 transition-all group bg-white"
                    onClick={() => {
                      setSelectedTutor(tutor.tutorName);
                    }}
                  >
                    <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary font-black text-2xl border-2 border-white shadow-lg group-hover:rotate-6 transition-transform italic">
                      {tutor.tutorName.charAt(0)}
                    </div>
                    
                    <div className="space-y-1 w-full overflow-hidden px-2">
                      <h3 className="text-lg font-black text-gray-900 italic tracking-tight truncate">{tutor.tutorName}</h3>
                      <div className="flex items-center justify-center gap-1.5 text-amber-400">
                        <Star size={14} className="fill-amber-400" />
                        <span className="text-xs font-black text-gray-900">{tutor.avgRating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 w-full">
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between px-5">
                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Reviews</div>
                        <div className="text-sm font-black text-gray-900">{tutor.reviews.length}</div>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between px-5">
                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">Success Rate</div>
                        <div className="text-sm font-black text-gray-900">{tutor.successRate}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest pt-2 group-hover:text-primary transition-colors">
                      Open History <ArrowRight size={14} />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* SECTION 2: DETAILED REVIEWS PAGE (Opens when a box is clicked) */
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTutor(null)}
                className="rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest bg-white border-gray-100 shadow-sm"
              >
                <ArrowLeft size={16} /> Back to Hub
              </Button>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <Clock size={12} /> Live Chronological stream
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl shadow-primary/5 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary font-black text-3xl border-2 border-white shadow-xl italic rotate-3">
                {selectedTutor.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter italic">{selectedTutor}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < Math.round(activeTutorData?.avgRating || 0) ? "fill-amber-400" : "text-slate-100"} />
                      ))}
                    </div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">{activeTutorData?.avgRating.toFixed(1)} avg rating</span>
                  </div>
                  <div className="h-4 w-px bg-slate-100 hidden md:block" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Users size={14} /> {activeTutorData?.reviews.length} Active Records
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {activeTutorData?.reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-7 h-full flex flex-col justify-between hover:shadow-xl transition-all border-slate-50 bg-white group/review">
                    <div className="space-y-5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-primary font-black italic shadow-inner text-xs">
                            {review.studentName.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-gray-900 italic tracking-tight">{review.studentName}</h5>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Verified User</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, starI) => (
                              <Star key={starI} size={10} className={starI < review.rating ? "fill-amber-400" : "text-gray-100"} />
                            ))}
                          </div>
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-[12px] font-medium text-gray-600 leading-relaxed italic border-l-2 border-primary/10 pl-4 py-1">
                        "{review.feedback}"
                      </p>
                    </div>
                    
                    <div className="mt-6 pt-5 border-t border-slate-50 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-black text-[8px] uppercase tracking-widest opacity-30 group-hover/review:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); onDelete(review.id); }}
                      >
                        <Trash2 size={10} className="mr-1.5" /> Remove Statement
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
