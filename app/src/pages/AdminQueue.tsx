import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Minus, Pause, Play, RotateCcw, Users, Clock,
  Loader2, Activity, CheckCircle2, AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'sonner';
import type { Queue } from '../types';

interface QueueWithDept extends Queue {
  departmentName?: string;
  avgServiceTime?: number;
}

const AdminQueue = () => {
  const { user } = useAuth();
  const { socket, joinHospital, leaveHospital } = useSocket();
  const [queues, setQueues] = useState<QueueWithDept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.hospitalId) { setIsLoading(false); return; }
    fetchQueues();
    joinHospital(user.hospitalId);

    const handler = (data: any) => {
      setQueues(prev => prev.map(q =>
        q.departmentId === data.departmentId
          ? { ...q, currentCount: data.currentCount, estimatedWait: data.estimatedWait, status: data.status }
          : q
      ));
    };
    socket?.on('queue_updated', handler);
    return () => {
      leaveHospital(user.hospitalId!);
      socket?.off('queue_updated', handler);
    };
  }, [user, socket]);

  const fetchQueues = async () => {
    try {
      const res = await api.get(`/queues/hospital/${user?.hospitalId}`);
      setQueues(res.data.data);
    } catch { toast.error('Failed to load queues'); }
    finally { setIsLoading(false); }
  };

  const updateQueue = async (departmentId: string, action: 'increment' | 'decrement' | 'set', count = 1) => {
    try {
      setUpdatingId(departmentId);
      await api.patch(`/queues/department/${departmentId}/update`, { action, count });
      toast.success('Queue updated');
      fetchQueues();
    } catch { toast.error('Failed to update queue'); }
    finally { setUpdatingId(null); }
  };

  const setStatus = async (departmentId: string, status: 'open' | 'closed' | 'paused') => {
    try {
      setUpdatingId(departmentId);
      await api.patch(`/queues/department/${departmentId}/status`, { status });
      toast.success(`Queue ${status}`);
      fetchQueues();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  if (!user?.hospitalId) return (
    <div className="text-center py-16 space-y-3">
      <AlertCircle className="w-14 h-14 text-amber-400 mx-auto" />
      <p className="text-slate-600 font-medium">No hospital assigned to your account</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Queue Management</h1>
          <p className="text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
            Real-time patient queue control
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700 border-0 px-3 py-1.5 text-sm w-fit">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse inline-block" />
          Live Updates Active
        </Badge>
      </div>

      {queues.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No departments found</h3>
          <p className="text-slate-400 mt-1">Contact your administrator to add departments</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {queues.map((queue) => {
            const isUpdating = updatingId === queue.departmentId;
            const estimatedWait = queue.estimatedWait ?? (queue.currentCount * (queue.avgServiceTime || 15));
            return (
              <Card key={queue._id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className={`h-1.5 w-full ${
                  queue.status === 'open' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                  queue.status === 'paused' ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                  'bg-slate-200'
                }`} />

                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800">{queue.departmentName}</CardTitle>
                      <p className="text-xs text-slate-400 mt-0.5">~{queue.avgServiceTime} min per patient</p>
                    </div>
                    <Badge className={`border-0 text-xs ${
                      queue.status === 'open' ? 'bg-green-100 text-green-700' :
                      queue.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {queue.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="text-3xl font-black text-slate-800">{queue.currentCount}</p>
                      <p className="text-xs text-slate-400">In Queue</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className={`text-3xl font-black ${
                        estimatedWait <= 15 ? 'text-green-600' :
                        estimatedWait <= 45 ? 'text-amber-600' : 'text-red-600'
                      }`}>{estimatedWait}m</p>
                      <p className="text-xs text-slate-400">Est. Wait</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Queue Controls</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => updateQueue(queue.departmentId, 'decrement')}
                        disabled={queue.currentCount === 0 || isUpdating}>
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Minus className="w-4 h-4 mr-1" />Served</>}
                      </Button>
                      <Button variant="outline" className="flex-1 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => updateQueue(queue.departmentId, 'increment')}
                        disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" />Add</>}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</p>
                    <div className="flex gap-2">
                      {queue.status === 'open' ? (
                        <Button variant="outline" className="flex-1 rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50"
                          onClick={() => setStatus(queue.departmentId, 'paused')} disabled={isUpdating}>
                          <Pause className="w-4 h-4 mr-1" /> Pause
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1 rounded-xl border-green-200 text-green-600 hover:bg-green-50"
                          onClick={() => setStatus(queue.departmentId, 'open')} disabled={isUpdating}>
                          <Play className="w-4 h-4 mr-1" /> Open
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={() => setStatus(queue.departmentId, 'closed')} disabled={isUpdating}>
                        <RotateCcw className="w-4 h-4 mr-1" /> Close
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quick Set Count</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 5, 10, 20].map((n) => (
                        <Button key={n} variant="outline" size="sm"
                          className={`rounded-lg text-xs font-bold ${queue.currentCount === n ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
                          onClick={() => updateQueue(queue.departmentId, 'set', n)} disabled={isUpdating}>
                          {n}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      Served today: <span className="font-semibold text-slate-600">{queue.totalServedToday}</span>
                    </p>
                    {queue.status === 'open' && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="w-3 h-3" /> Accepting
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminQueue;
