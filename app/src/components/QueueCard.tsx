import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, Users, Activity, MapPin, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Queue, Department, Hospital } from '../types';

interface QueueCardProps {
  hospital: Hospital;
  department: Department;
  queue?: Queue;
  showBookButton?: boolean;
}

const QueueCard = ({ hospital, department, queue, showBookButton = true }: QueueCardProps) => {
  const { socket, joinDepartment, leaveDepartment } = useSocket();
  const [currentQueue, setCurrentQueue] = useState(queue);
  const [justUpdated, setJustUpdated] = useState(false);

  useEffect(() => {
    if (!department._id) return;
    joinDepartment(department._id);

    const handler = (data: any) => {
      if (data.departmentId?.toString() === department._id?.toString()) {
        setCurrentQueue((prev) => ({
          ...prev,
          currentCount: data.currentCount,
          estimatedWait: data.estimatedWait,
          status: data.status,
          lastUpdated: data.lastUpdated,
        } as Queue));
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 2000);
      }
    };

    socket?.on('queue_updated', handler);
    return () => {
      leaveDepartment(department._id);
      socket?.off('queue_updated', handler);
    };
  }, [department._id, socket]);

  const currentCount = currentQueue?.currentCount ?? queue?.currentCount ?? 0;
  const estimatedWait = currentQueue?.estimatedWait ?? queue?.estimatedWait ?? 0;
  const status = currentQueue?.status ?? queue?.status ?? 'closed';

  const getWaitColor = (mins: number) => {
    if (mins <= 15) return 'text-green-600';
    if (mins <= 45) return 'text-amber-600';
    return 'text-red-600';
  };

  const getWaitBadge = (mins: number) => {
    if (mins <= 15) return <Badge className="bg-green-100 text-green-700 border-0">Low Wait</Badge>;
    if (mins <= 45) return <Badge className="bg-amber-100 text-amber-700 border-0">Moderate</Badge>;
    return <Badge className="bg-red-100 text-red-700 border-0">High Wait</Badge>;
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'open': return <Badge className="bg-green-500 text-white border-0">Open</Badge>;
      case 'paused': return <Badge className="bg-amber-500 text-white border-0">Paused</Badge>;
      default: return <Badge className="bg-slate-400 text-white border-0">Closed</Badge>;
    }
  };

  const formatWait = (mins: number) => {
    if (mins === 0) return '< 5 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <Card className={`overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${justUpdated ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-blue-50/50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">{department.name}</CardTitle>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin className="w-3 h-3" />
              {hospital.name}
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 text-center transition-all ${justUpdated ? 'bg-blue-50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Users className="w-3.5 h-3.5" /> In Queue
            </div>
            <p className={`text-3xl font-black transition-all ${justUpdated ? 'text-blue-600 scale-110' : 'text-slate-800'}`}>
              {currentCount}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5" /> Est. Wait
            </div>
            <p className={`text-3xl font-black ${getWaitColor(estimatedWait)}`}>
              {formatWait(estimatedWait)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Wait level</span>
            {getWaitBadge(estimatedWait)}
          </div>
          <Progress
            value={Math.min((estimatedWait / 120) * 100, 100)}
            className="h-2"
          />
        </div>

        {/* Live indicator */}
        {status === 'open' && (
          <div className="flex items-center gap-2 text-xs">
            <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" />
            <span className="text-green-600 font-medium">Live updates active</span>
            {justUpdated && (
              <span className="text-blue-500 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Just updated
              </span>
            )}
          </div>
        )}

        {showBookButton && status === 'open' && (
          <Link to={`/hospitals/${hospital._id}?department=${department._id}`}>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-xl h-10">
              Book Appointment
            </Button>
          </Link>
        )}

        {status === 'closed' && (
          <div className="text-center text-xs text-slate-400 py-1">
            This department is currently closed
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueCard;
