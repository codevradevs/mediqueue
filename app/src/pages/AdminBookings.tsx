import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar, Search, CheckCircle2, X, Loader2, Filter,
  Clock, User, Building2, AlertCircle, Phone,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed:    { label: 'Confirmed',   className: 'bg-blue-100 text-blue-700' },
  pending:      { label: 'Pending',     className: 'bg-amber-100 text-amber-700' },
  'in-progress':{ label: 'In Progress', className: 'bg-purple-100 text-purple-700' },
  completed:    { label: 'Completed',   className: 'bg-green-100 text-green-700' },
  cancelled:    { label: 'Cancelled',   className: 'bg-slate-100 text-slate-500' },
  'no-show':    { label: 'No Show',     className: 'bg-red-100 text-red-700' },
};

const AdminBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.hospitalId) fetchBookings();
  }, [user, selectedDate]);

  useEffect(() => { applyFilters(); }, [bookings, searchQuery, statusFilter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/bookings/hospital/${user?.hospitalId}`, {
        params: { date: selectedDate },
      });
      setBookings(res.data.data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setIsLoading(false); }
  };

  const applyFilters = () => {
    let result = [...bookings];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.userId?.name?.toLowerCase().includes(q) ||
        b.userId?.phone?.includes(q) ||
        b.departmentId?.name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(b => b.status === statusFilter);
    setFiltered(result);
  };

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      setUpdatingId(bookingId);
      await api.patch(`/bookings/${bookingId}/status`, { status });
      toast.success('Status updated');
      fetchBookings();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });

  if (!user?.hospitalId) return (
    <div className="text-center py-16 space-y-3">
      <AlertCircle className="w-14 h-14 text-amber-400 mx-auto" />
      <p className="text-slate-600 font-medium">No hospital assigned to your account</p>
    </div>
  );

  const counts = Object.keys(statusConfig).reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Bookings</h1>
          <p className="text-slate-500">Manage patient appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto rounded-xl h-10"
          />
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          counts[key] > 0 && (
            <Badge
              key={key}
              className={`cursor-pointer border-0 px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === key ? cfg.className + ' ring-2 ring-offset-1 ring-current' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            >
              {cfg.label} ({counts[key]})
            </Badge>
          )
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search patient name, phone or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-44 rounded-xl h-10">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold">
              Appointments
              <span className="ml-2 text-base font-normal text-slate-400">({filtered.length})</span>
            </CardTitle>
            <Badge variant="outline" className="rounded-lg">{formatDate(selectedDate)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Patient', 'Department', 'Time', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const cfg = statusConfig[b.status];
                    const isUpdating = updatingId === b._id;
                    return (
                      <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-slate-800">{b.userId?.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />{b.userId?.phone || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {b.departmentId?.name || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatTime(b.scheduledTime)}
                          </div>
                          {b.queueNumber && (
                            <p className="text-xs text-slate-400 mt-0.5">Queue #{b.queueNumber}</p>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={`border-0 text-xs ${cfg?.className || 'bg-slate-100 text-slate-600'}`}>
                            {cfg?.label || b.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1.5">
                            {b.status === 'confirmed' && (
                              <Button size="sm" variant="outline"
                                className="rounded-lg text-xs border-purple-200 text-purple-600 hover:bg-purple-50 h-7 px-2.5"
                                onClick={() => updateStatus(b._id, 'in-progress')}
                                disabled={isUpdating}>
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Start'}
                              </Button>
                            )}
                            {b.status === 'in-progress' && (
                              <Button size="sm" variant="outline"
                                className="rounded-lg text-xs border-green-200 text-green-600 hover:bg-green-50 h-7 px-2.5"
                                onClick={() => updateStatus(b._id, 'completed')}
                                disabled={isUpdating}>
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle2 className="w-3 h-3 mr-1" />Done</>}
                              </Button>
                            )}
                            {b.status === 'pending' && (
                              <Button size="sm" variant="outline"
                                className="rounded-lg text-xs border-blue-200 text-blue-600 hover:bg-blue-50 h-7 px-2.5"
                                onClick={() => updateStatus(b._id, 'confirmed')}
                                disabled={isUpdating}>
                                Confirm
                              </Button>
                            )}
                            {['confirmed', 'pending'].includes(b.status) && (
                              <Button size="sm" variant="outline"
                                className="rounded-lg text-xs border-red-200 text-red-500 hover:bg-red-50 h-7 px-2"
                                onClick={() => updateStatus(b._id, 'cancelled')}
                                disabled={isUpdating}>
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                              </Button>
                            )}
                            {b.status === 'confirmed' && (
                              <Button size="sm" variant="outline"
                                className="rounded-lg text-xs border-slate-200 text-slate-500 hover:bg-slate-50 h-7 px-2.5"
                                onClick={() => updateStatus(b._id, 'no-show')}
                                disabled={isUpdating}>
                                No Show
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-600">No bookings found</h3>
              <p className="text-slate-400 mt-1 text-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No appointments for this date'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;
