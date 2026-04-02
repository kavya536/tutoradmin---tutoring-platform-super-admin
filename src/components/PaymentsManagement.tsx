import * as React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CreditCard, 
  CheckCircle2, 
  Eye,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Wallet,
  Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, Table, Modal } from './UI';
import { Payment } from '../types';

interface PaymentsManagementProps {
  payments: Payment[];
  onMarkAsPaid: (id: string) => void;
}

export const PaymentsManagement = ({ payments, onMarkAsPaid }: PaymentsManagementProps) => {
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredPayments = payments.filter(p => 
    p.tutorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const pendingPayouts = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'paid').length;

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Payouts', value: `$${pendingPayouts.toLocaleString()}`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed Payments', value: completedPayments, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
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
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payments Management</h2>
          <p className="text-gray-500 font-medium">Track revenue and manage tutor payouts.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.05,
              duration: 0.3
            }}
          >
            <Card className="p-6 hover:shadow-2xl hover:scale-[1.02] transition-all group cursor-default border-b-4 border-transparent hover:border-primary/20">
              <div className="flex items-center space-x-4">
                <div className={cn('p-3 rounded-xl transition-colors group-hover:bg-white', stat.bg)}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">{stat.value}</h3>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <Table headers={['Tutor Name', 'Amount', 'Method', 'Date', 'Status', 'Actions']}>
          <AnimatePresence mode="popLayout">
            {filteredPayments.map((payment, index) => (
              <motion.tr 
                key={payment.id} 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                layout
                className="hover:bg-gray-50/80 transition-all group cursor-default border-b border-gray-100 last:border-0"
              >
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform">
                    <Wallet size={16} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{payment.tutorName}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-black text-gray-900">${payment.amount.toLocaleString()}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard size={12} className="text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{payment.method}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-500">
                {payment.date}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Badge variant={payment.status === 'paid' ? 'success' : 'warning'}>
                    {payment.status.toUpperCase()}
                  </Badge>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="font-bold text-xs"
                    onClick={() => setOpenMenuId(openMenuId === payment.id ? null : payment.id)}
                  >
                    Actions
                    <MoreVertical size={14} className="ml-1" />
                  </Button>
                  
                  <AnimatePresence>
                    {openMenuId === payment.id && (
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
                            onClick={() => { setSelectedPayment(payment); setOpenMenuId(null); }}
                            className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>
                          {payment.status === 'pending' && (
                            <button 
                              onClick={() => { onMarkAsPaid(payment.id); setOpenMenuId(null); }}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-green-600 hover:bg-green-50 flex items-center space-x-2 transition-colors"
                            >
                              <CheckCircle2 size={14} />
                              <span>Mark as Paid</span>
                            </button>
                          )}
                          <button 
                            onClick={() => setOpenMenuId(null)}
                            className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                          >
                            <CreditCard size={14} />
                            <span>Download Receipt</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </td>
            </motion.tr>
          ))}
          </AnimatePresence>
        </Table>
      </Card>

      <Modal 
        isOpen={!!selectedPayment} 
        onClose={() => setSelectedPayment(null)} 
        title="Payment Details"
      >
        {selectedPayment && (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-8 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Amount to Pay</p>
                <p className="text-4xl font-black text-primary tracking-tight">${selectedPayment.amount.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <Badge variant={selectedPayment.status === 'paid' ? 'success' : 'warning'}>
                  {selectedPayment.status}
                </Badge>
                <p className="text-xs text-gray-500 mt-2 font-medium">Transaction ID: #TXN-98234</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-500">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tutor</p>
                    <p className="text-lg font-bold text-gray-900">{selectedPayment.tutorName}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-500">
                    <Banknote size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                    <p className="text-lg font-bold text-gray-900">{selectedPayment.method}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      {selectedPayment.method === 'UPI' ? 'upi-id@bank' : 'Acc: **** 9823'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Payout Summary</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Tutor Earnings</span>
                    <span className="font-bold text-gray-900">${selectedPayment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Platform Fee (0%)</span>
                    <span className="font-bold text-gray-900">$0.00</span>
                  </div>
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex justify-between text-base">
                    <span className="text-gray-900 font-black">Total Payout</span>
                    <span className="font-black text-primary">${selectedPayment.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>Close</Button>
              {selectedPayment.status === 'pending' && (
                <Button onClick={() => { onMarkAsPaid(selectedPayment.id); setSelectedPayment(null); }}>
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
