import * as React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { Card, Button } from './UI';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const bookingData = [
  { name: 'Jan', bookings: 400 },
  { name: 'Feb', bookings: 300 },
  { name: 'Mar', bookings: 600 },
  { name: 'Apr', bookings: 800 },
  { name: 'May', bookings: 500 },
  { name: 'Jun', bookings: 900 },
];

const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 7000 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 8500 },
];

const subjectData = [
  { name: 'Mathematics', value: 400, color: '#005F63' },
  { name: 'Science', value: 300, color: '#008B8B' },
  { name: 'Languages', value: 300, color: '#20B2AA' },
  { name: 'History', value: 200, color: '#48D1CC' },
];

export const Reports = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Platform Reports</h2>
          <p className="text-gray-500 font-medium">In-depth analysis of platform performance and trends.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="font-bold">
            <Calendar size={16} className="mr-2" />
            Last 6 Months
          </Button>
          <Button className="font-bold">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Bookings Trend</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="bookings" fill="#005F63" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Revenue Growth</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#008B8B" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#008B8B', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Popular Subjects</h3>
          <div className="flex flex-col md:flex-row items-center justify-around h-80">
            <div className="w-full h-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {subjectData.map((item) => (
                <div key={item.name} className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-gray-600">{item.name}</span>
                  <span className="text-sm font-black text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Top Tutors by Revenue</h3>
          <div className="space-y-6">
            {[
              { name: 'Dr. Sarah Wilson', revenue: 4500, color: 'bg-primary' },
              { name: 'Elena Rodriguez', revenue: 3200, color: 'bg-accent' },
              { name: 'James Miller', revenue: 2800, color: 'bg-teal-400' },
              { name: 'Robert Chen', revenue: 1500, color: 'bg-teal-200' },
            ].map((tutor) => (
              <div key={tutor.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{tutor.name}</p>
                    <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                      <div className={cn('h-full rounded-full', tutor.color)} style={{ width: `${(tutor.revenue / 5000) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <span className="text-sm font-black text-primary">${tutor.revenue}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
