import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin, Phone, Mail, Globe, Clock, ArrowLeft, Building2,
  Users, Calendar, Loader2, CheckCircle2, Activity,
} from 'lucide-react';
import api from '../services/api';
import type { Hospital, Department } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const HospitalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { socket, joinHospital, leaveHospital } = useSocket();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSymptoms, setBookingSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveQueues, setLiveQueues] = useState<Record<string, { currentCount: number; estimatedWait: number; status: string }>>({});

  useEffect(() => {
    if (id) {
      fetchHospital();
      joinHospital(id);
      socket?.on('queue_updated', (data: any) => {
        setLiveQueues(prev => ({
          ...prev,
          [data.departmentId]: {
            currentCount: data.currentCount,
            estimatedWait: data.estimatedWait,
            status: data.status,
          },
        }));
      });
      return () => {
        leaveHospital(id);
        socket?.off('queue_updated');
      };
    }
  }, [id, socket]);

  useEffect(() => {
    const deptId = searchParams.get('department');
    if (deptId && hospital?.departments) {
      const dept = hospital.departments.find(d => d._id === deptId);
      if (dept) { setSelectedDepartment(dept); setIsBookingDialogOpen(true); }
    }
  }, [searchParams, hospital]);

  const fetchHospital = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/hospitals/${id}`);
      setHospital(response.data.data);
    } catch { toast.error('Failed to load hospital details'); }
    finally { setIsLoading(false); }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to book an appointment'); return; }
    if (!selectedDepartment) return;
    try {
      setIsSubmitting(true);
      await api.post('/bookings', {
        hospitalId: id,
        departmentId: selectedDepartment._id,
        scheduledTime: new Date(bookingDate).toISOString(),
        notes: bookingNotes,
        symptoms: bookingSymptoms,
      });
      toast.success('Appointment booked! Check My Bookings for details.');
      setIsBookingDialogOpen(false);
      setBookingDate(''); setBookingNotes(''); setBookingSymptoms('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally { setIsSubmitting(false); }
  };

  const getQueueData = (dept: Department) => {
    const live = liveQueues[dept._id];
    if (live) return live;
    return {
      currentCount: dept.queue?.currentCount ?? 0,
      estimatedWait: dept.queue?.estimatedWait ?? 0,
      status: dept.queue?.status ?? 'closed',
    };
  };

  const getWaitColor = (mins: number) => {
    if (mins <= 15) return 'text-green-600';
    if (mins <= 45) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge className="bg-green-500 text-white border-0">Open</Badge>;
      case 'paused': return <Badge className="bg-amber-500 text-white border-0">Paused</Badge>;
      default: return <Badge className="bg-slate-400 text-white border-0">Closed</Badge>;
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
        <p className="text-slate-500">Loading hospital details...</p>
      </div>
    </div>
  );

  if (!hospital) return (
    <div className="text-center py-16">
      <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-slate-700">Hospital not found</h2>
      <Link to="/hospitals"><Button variant="outline" className="mt-4 rounded-xl"><ArrowLeft className="w-4 h-4 mr-2" />Back to Hospitals</Button></Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link to="/hospitals">
        <Button variant="ghost" className="pl-0 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hospitals
        </Button>
      </Link>

      {/* Hospital Header */}
      <div className="relative rounded-2xl overflow-hidden h-56 md:h-72">
        <img
          src={hospital.image || '/hospital-hero.jpg'}
          alt={hospital.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">{hospital.location.county}</Badge>
                {hospital.isActive && <Badge className="bg-green-500/90 text-white border-0">Active</Badge>}
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white">{hospital.name}</h1>
              <p className="text-blue-200 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />{hospital.location.address}, {hospital.location.city}
              </p>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${hospital.contact.phone}`}>
                <Button className="bg-white/20 backdrop-blur text-white border border-white/30 hover:bg-white/30 rounded-xl">
                  <Phone className="w-4 h-4 mr-2" /> Call
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Phone, label: 'Phone', value: hospital.contact.phone },
          hospital.contact.email ? { icon: Mail, label: 'Email', value: hospital.contact.email } : null,
          hospital.contact.website ? { icon: Globe, label: 'Website', value: hospital.contact.website } : null,
          { icon: Clock, label: 'Hours', value: 'Mon – Sun' },
        ].filter(Boolean).map((item: any) => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="font-semibold text-sm text-slate-800 truncate">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList className="grid w-full max-w-xs grid-cols-2 rounded-xl">
          <TabsTrigger value="departments" className="rounded-lg">Departments</TabsTrigger>
          <TabsTrigger value="about" className="rounded-lg">About</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Departments & Queues</h2>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                Live queue data
              </p>
            </div>
          </div>

          {hospital.departments && hospital.departments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospital.departments.map((dept) => {
                const qData = getQueueData(dept);
                return (
                  <Card key={dept._id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base font-bold">{dept.name}</CardTitle>
                        {getStatusBadge(qData.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                            <Users className="w-3.5 h-3.5" /> Queue
                          </div>
                          <p className="text-2xl font-black text-slate-800">{qData.currentCount}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                            <Clock className="w-3.5 h-3.5" /> Wait
                          </div>
                          <p className={`text-2xl font-black ${getWaitColor(qData.estimatedWait)}`}>
                            {qData.estimatedWait === 0 ? '—' : `${qData.estimatedWait}m`}
                          </p>
                        </div>
                      </div>

                      {qData.status === 'open' && (
                        <Dialog
                          open={isBookingDialogOpen && selectedDepartment?._id === dept._id}
                          onOpenChange={(open) => {
                            setIsBookingDialogOpen(open);
                            if (open) setSelectedDepartment(dept);
                            else setSelectedDepartment(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold"
                              onClick={() => setSelectedDepartment(dept)}
                            >
                              <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black">Book Appointment</DialogTitle>
                              <DialogDescription>
                                {dept.name} — {hospital.name}
                              </DialogDescription>
                            </DialogHeader>
                            {!user ? (
                              <div className="text-center py-6 space-y-3">
                                <p className="text-slate-600">Please sign in to book an appointment</p>
                                <Link to="/login">
                                  <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white">Sign In</Button>
                                </Link>
                              </div>
                            ) : (
                              <form onSubmit={handleBooking} className="space-y-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="date" className="font-semibold">Preferred Date & Time</Label>
                                  <Input id="date" type="datetime-local" value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    required min={new Date().toISOString().slice(0, 16)}
                                    className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="symptoms" className="font-semibold">Symptoms <span className="text-slate-400 font-normal">(optional)</span></Label>
                                  <Textarea id="symptoms" placeholder="Describe your symptoms..."
                                    value={bookingSymptoms} onChange={(e) => setBookingSymptoms(e.target.value)}
                                    className="rounded-xl resize-none" rows={2} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="notes" className="font-semibold">Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
                                  <Textarea id="notes" placeholder="Any special requirements..."
                                    value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)}
                                    className="rounded-xl resize-none" rows={2} />
                                </div>
                                <Button type="submit"
                                  className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold"
                                  disabled={isSubmitting}>
                                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                  Confirm Booking
                                </Button>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}

                      {qData.status !== 'open' && (
                        <div className="text-center text-xs text-slate-400 py-1 bg-slate-50 rounded-xl">
                          Not accepting bookings right now
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No departments available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="about">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>About {hospital.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-slate-600 leading-relaxed">
                {hospital.description || 'No description available for this hospital.'}
              </p>
              {hospital.operatingHours && (
                <div>
                  <h3 className="font-bold text-slate-800 mb-3">Operating Hours</h3>
                  <div className="grid sm:grid-cols-2 gap-1">
                    {Object.entries(hospital.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                        <span className="capitalize text-slate-600 font-medium">{day}</span>
                        <span className="text-slate-800 font-semibold">{hours.open} – {hours.close}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HospitalDetail;
