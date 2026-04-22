import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const METRICS = [
  { label: 'Active Projects', value: '12', trend: '+2 this month', icon: TrendingUp },
  { label: 'Pending Approvals', value: '4', trend: 'Urgent attention', icon: Clock },
  { label: 'Total Budget', value: '$14.2M', trend: '92% utilized', icon: CheckCircle2 },
  { label: 'Critical Risks', value: '2', trend: 'Supply chain', icon: AlertCircle },
];

const PIE_DATA = [
  { name: 'On Track', value: 8 },
  { name: 'At Risk', value: 2 },
  { name: 'Delayed', value: 2 },
];
const COLORS = ['#111827', '#9CA3AF', '#E5E7EB'];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">Welcome back, Le Mai Khanh</h2>
        <p className="text-gray-500 font-light">Here is an overview of your studio's performance.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-full">
                  <Icon className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">{metric.trend}</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{metric.value}</h3>
              <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Health */}
        <div className="lg:col-span-1 bg-white rounded border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">Project Health</h3>
          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">12</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
             {PIE_DATA.map((entry, index) => (
               <div key={index} className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                   <span className="text-gray-600">{entry.name}</span>
                 </div>
                 <span className="font-medium text-gray-900">{entry.value}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Quick Actions / Recent Activity Placeholder */}
        <div className="lg:col-span-2 bg-gray-50 rounded border border-gray-200 p-8 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Clock className="text-gray-400" size={32} strokeWidth={1} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent alerts</h3>
            <p className="text-gray-500 max-w-sm">Your projects are running smoothly. Check back later for updates or start a new task.</p>
            <button className="mt-6 px-6 py-2 bg-white border border-gray-300 text-gray-900 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                View All Tasks
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;