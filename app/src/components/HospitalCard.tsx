import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, ArrowRight, Building2, Users } from 'lucide-react';
import type { Hospital } from '../types';

interface HospitalCardProps {
  hospital: Hospital;
}

const HospitalCard = ({ hospital }: HospitalCardProps) => {
  const getOpenStatus = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hours = hospital.operatingHours?.[day];
    if (!hours) return { isOpen: false, text: 'Closed today' };
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = hours.open.split(':').map(Number);
    const [closeHour, closeMin] = hours.close.split(':').map(Number);
    const isOpen = currentTime >= openHour * 60 + openMin && currentTime < closeHour * 60 + closeMin;
    return { isOpen, text: isOpen ? `Open until ${hours.close}` : `Opens ${hours.open}` };
  };

  const status = getOpenStatus();
  const totalInQueue = hospital.departments?.reduce((sum, d) => sum + (d.queue?.currentCount || 0), 0) || 0;
  const openDepts = hospital.departments?.filter(d => d.queue?.status === 'open').length || 0;

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100">
        {hospital.image ? (
          <img
            src={hospital.image}
            alt={hospital.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-16 h-16 text-blue-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <Badge className={`${status.isOpen ? 'bg-green-500' : 'bg-slate-600'} text-white border-0 shadow`}>
            {status.isOpen ? '● Open' : '● Closed'}
          </Badge>
          {totalInQueue > 0 && (
            <Badge className="bg-white/90 text-slate-700 border-0 shadow">
              <Users className="w-3 h-3 mr-1" />
              {totalInQueue} waiting
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-bold line-clamp-1 text-slate-800">{hospital.name}</CardTitle>
          <Badge variant="outline" className="text-xs shrink-0 text-blue-600 border-blue-200">
            {hospital.location.county}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="space-y-1.5 text-sm text-slate-500">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
            <span className="line-clamp-1">{hospital.location.address}, {hospital.location.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{hospital.contact.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className={status.isOpen ? 'text-green-600 font-medium' : 'text-slate-400'}>{status.text}</span>
          </div>
        </div>

        {openDepts > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {openDepts} department{openDepts !== 1 ? 's' : ''} accepting patients
          </div>
        )}

        <Link to={`/hospitals/${hospital._id}`}>
          <Button variant="outline" className="w-full group/btn rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 mt-1">
            View Queue & Book
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default HospitalCard;
