import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar, Clock, MapPin, Building2, Loader2, X, ArrowRight, CheckCircle2, Hash,
} from 'lucide-react';
import api from '../services/api';
import type { Booking } from '../types';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed:     { label: 'Confirmed',   className: 'bg-blue-100 text-blue-700' },
  pending:       { label: 'Pending',     className: 'bg-amber-100 text-amber-700' },
  'in-progress': { label: 'In Progress', className: 'bg-purple-100 text-purple-700' },
  completed:     { label: 'Completed',   className: 'bg-green-100 text-green-700' },
  cancelled:     { label: 'Cancelled',   className: 'bg-slate-100 text-slate-500' },
  'no-show':     { label: 'No Show',     className: 'bg-red-100 text-red-700' },
};

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data.data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setIsLoading(false); }
  };

  const handleCancel = async (id: string) => {
    try {
      setCancellingId(id);
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch { toast.error('Failed to cancel booking'); }
    finally { setCancellingId(null); }
  };

  const upcoming = bookings.filter(b => ['confirmed', 'pending', 'in-progress'].includes(b.status));
  const past = bookings.filter(b => ['completed', 'cancelled', 'no-show'].includes(b.status));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">My Bookings</h1>
          <p className="text-slate-500">Manage your hospital appointments</p>
        </div>
        <Link to="/hospitals">
          <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold">
            <Calendar className="w-4 h-4 mr-2" /> Book New Appointment
          </Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState message="No bookings yet" showCta />
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-5">
          <TabsList className="grid w-full max-w-xs grid-cols-2 rounded-xl h-10">
            <TabsTrigger value="upcoming" className="rounded-lg text-sm">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg text-sm">
              Past ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {upcoming.length > 0
              ? upcoming.map(b => (
                  <BookingCard key={b._id} booking={b} onCancel={handleCancel}
                    cancellingId={cancellingId} formatDate={formatDate} formatTime={formatTime} />
                ))
              : <EmptyState message="No upcoming appointments" />}
          </TabsContent>

          <TabsContent value="past" className="space-y-3">
            {past.length > 0
              ? past.map(b => (
                  <BookingCard key={b._id} booking={b} onCancel={handleCancel}
                    cancellingId={cancellingId} formatDate={formatDate} formatTime={formatTime} isPast />
                ))
              : <EmptyState message="No past appointments" />}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  cancellingId: string | null;
  formatDate: (d: string) => string;
  formatTime: (d: string) => string;
  isPast?: boolean;
}

const BookingCard = ({ booking, onCancel, cancellingId, formatDate, formatTime, isPast }: BookingCardProps) => {
  const hospital = typeof booking.hospitalId === 'object' ? booking.hospitalId : null;
  const department = typeof booking.departmentId === 'object' ? booking.departmentId : null;
  const cfg = statusConfig[booking.status];

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className={`h-1 w-full ${
        booking.status === 'confirmed' ? 'bg-blue-400' :
        booking.status === 'in-progress' ? 'bg-purple-400' :
        booking.status === 'completed' ? 'bg-green-400' :
        booking.status === 'pending' ? 'bg-amber-400' : 'bg-slate-200'
      }`} />
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`border-0 text-xs ${cfg?.className || 'bg-slate-100 text-slate-600'}`}>
                {cfg?.label || booking.status}
              </Badge>
              {booking.queueNumber && (
                <Badge variant="outline" className="text-xs rounded-lg">
                  <Hash className="w-3 h-3 mr-1" />Queue {booking.queueNumber}
                </Badge>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              {department?.name || 'Department'}
            </h3>

            <div className="space-y-1.5 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-slate-700">{hospital?.name || 'Hospital'}</span>
              </div>
              {hospital && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{hospital.location.address}, {hospital.location.city}</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formatDate(booking.scheduledTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-700">{formatTime(booking.scheduledTime)}</span>
                </div>
              </div>
            </div>

            {booking.symptoms && (
              <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                <span className="font-semibold text-slate-700">Symptoms: </span>{booking.symptoms}
              </p>
            )}
          </div>

          {!isPast && ['confirmed', 'pending'].includes(booking.status) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline"
                  className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 shrink-0">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-black">Cancel Booking?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your appointment at <strong>{hospital?.name}</strong>?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Keep Booking</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancel(booking._id)}
                    className="rounded-xl bg-red-600 hover:bg-red-700"
                    disabled={cancellingId === booking._id}
                  >
                    {cancellingId === booking._id
                      ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      : <X className="w-4 h-4 mr-2" />}
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {booking.status === 'completed' && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm font-semibold shrink-0">
              <CheckCircle2 className="w-5 h-5" /> Completed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ message, showCta }: { message: string; showCta?: boolean }) => (
  <div className="text-center py-20">
    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Calendar className="w-10 h-10 text-blue-200" />
    </div>
    <h3 className="text-lg font-bold text-slate-700">{message}</h3>
    {showCta && (
      <>
        <p className="text-slate-400 mt-1 mb-5 text-sm">Book your first appointment today — it's free</p>
        <Link to="/hospitals">
          <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold">
            Find Hospitals <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </>
    )}
  </div>
);

export default Bookings;
