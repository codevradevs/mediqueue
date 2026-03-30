import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, Clock, Calendar, TrendingUp, ArrowRight, Loader2,
  Activity, Building2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  totalDepartments: number;
  totalInQueue: number;
  totalServedToday: number;
  avgWaitTime: number;
  departments: Array<{ name: string; queue: { currentCount: number; totalServedToday: number; status: string } }>;
}

const chartData = [
  { time: '8AM', patients: 12 }, { time: '9AM', patients: 22 },
  { time: '10AM', patients: 35 }, { time: '11AM', patients: 48 },
  { time: '12PM', patients: 45 }, { time: '1PM', patients: 38 },
  { time: '2PM', patients: 42 }, { time: '3PM', patients: 30 },
  { time: '4PM', patients: 20 }, { time: '5PM', patients: 10 },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    if (user?.hospitalId) {
      fetchStats();
      fetchRecentBookings();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get(`/hospitals/${user?.hospitalId}/stats`);
      setStats(response.data.data);
    } catch { toast.error('Failed to load stats'); }
    finally { setIsLoading(false); }
  };

  const fetchRecentBookings = async () => {
    try {
      const response = await api.get(`/bookings/hospital/${user?.hospitalId}/today`);
      setRecentBookings(response.data.data.slice(0, 6));
    } catch { /* silent */ }
  };

  const statusColor: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    'in-progress': 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-slate-100 text-slate-600',
    'no-show': 'bg-red-100 text-red-700',
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!user?.hospitalId) return (
    <div className="text-center py-16 space-y-4">
      <AlertCircle className="w-16 h-16 text-amber-400 mx-auto" />
      <h2 className="text-xl font-bold text-slate-700">No Hospital Assigned</h2>
      <p className="text-slate-500">Your account is not linked to a hospital. Contact the super admin.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Dashboard</h1>
          <p className="text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
            Live hospital operations
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/queue">
            <Button variant="outline" className="rounded-xl">
              <Activity className="w-4 h-4 mr-2" /> Manage Queue
            </Button>
          </Link>
          <Link to="/admin/bookings">
            <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
              <Calendar className="w-4 h-4 mr-2" /> View Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'In Queue Now', value: stats?.totalInQueue ?? 0, icon: Users, color: 'blue', trend: '+5%' },
          { title: 'Served Today', value: stats?.totalServedToday ?? 0, icon: TrendingUp, color: 'green', trend: '+12%' },
          { title: 'Avg Wait Time', value: `${stats?.avgWaitTime ?? 0}m`, icon: Clock, color: 'amber', trend: '-8%' },
          { title: 'Departments', value: stats?.totalDepartments ?? 0, icon: Building2, color: 'purple' },
        ].map((s) => (
          <Card key={s.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{s.title}</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">{s.value}</p>
                  {s.trend && (
                    <p className={`text-xs mt-1 font-medium ${s.trend.startsWith('+') ? 'text-green-600' : 'text-blue-600'}`}>
                      {s.trend} from yesterday
                    </p>
                  )}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${s.color}-100`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue status */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-bold">Queue Status by Department</CardTitle>
              <Link to="/admin/queue">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 rounded-lg">
                  Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats?.departments.map((dept, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    dept.queue.status === 'open' ? 'bg-green-500 animate-pulse' :
                    dept.queue.status === 'paused' ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{dept.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{dept.queue.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-800">{dept.queue.currentCount}</p>
                  <p className="text-xs text-slate-400">in queue</p>
                </div>
              </div>
            ))}
            {(!stats?.departments || stats.departments.length === 0) && (
              <div className="text-center py-8 text-slate-400">No departments found</div>
            )}
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-bold">Today's Patient Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Peak Hours</span>
              <Badge className="bg-blue-100 text-blue-700 border-0">11AM – 1PM</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold">Today's Bookings</CardTitle>
            <Link to="/admin/bookings">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 rounded-lg">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Patient', 'Department', 'Time', 'Status'].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b: any, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{b.userId?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{b.userId?.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-sm text-slate-600">{b.departmentId?.name || '—'}</td>
                      <td className="py-3 px-3 text-sm text-slate-600">
                        {new Date(b.scheduledTime).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={`text-xs border-0 ${statusColor[b.status] || 'bg-slate-100 text-slate-600'}`}>
                          {b.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">No bookings today yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
