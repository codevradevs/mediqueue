import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search, MapPin, Clock, Shield, Activity, ArrowRight,
  Hospital as HospitalIcon, Users, CheckCircle2, Smartphone,
  Star, TrendingDown, Bell, Zap,
} from 'lucide-react';
import api from '../services/api';
import type { Hospital } from '../types';
import QueueCard from '../components/QueueCard';
import { toast } from 'sonner';

const Home = () => {
  const [featuredHospitals, setFeaturedHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedHospitals();
  }, []);

  const fetchFeaturedHospitals = async () => {
    try {
      const response = await api.get('/hospitals?limit=3');
      setFeaturedHospitals(response.data.data.slice(0, 3));
    } catch {
      toast.error('Failed to load hospitals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/hospitals?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const features = [
    { icon: Clock, title: 'Real-Time Queue', description: 'See live wait times before you leave home. No more guessing or wasted trips.' },
    { icon: Smartphone, title: 'Easy Booking', description: 'Book appointments in seconds from your phone. Get notified when it\'s your turn.' },
    { icon: Shield, title: 'Trusted Hospitals', description: 'Partnered with verified hospitals across Kenya for quality, reliable care.' },
    { icon: MapPin, title: 'Find Nearby', description: 'Discover hospitals near you across all 47 counties with location-based search.' },
  ];

  const stats = [
    { value: '50+', label: 'Partner Hospitals', icon: HospitalIcon },
    { value: '10K+', label: 'Monthly Bookings', icon: Users },
    { value: '2hrs', label: 'Avg Time Saved', icon: TrendingDown },
    { value: '4.9★', label: 'Patient Rating', icon: Star },
  ];

  const testimonials = [
    {
      name: 'Amina Hassan',
      location: 'Mombasa',
      text: 'I used to spend 4 hours waiting at the hospital. Now I check MediQueue, arrive at the right time, and I\'m done in 45 minutes!',
      avatar: '👩🏾',
    },
    {
      name: 'James Ochieng',
      location: 'Kisumu',
      text: 'As a busy father of three, MediQueue has been a lifesaver. I can book appointments for my kids without taking a full day off work.',
      avatar: '👨🏿',
    },
    {
      name: 'Dr. Njeri Waweru',
      location: 'Nairobi',
      text: 'Our clinic adopted MediQueue and patient satisfaction scores went up by 60%. The queue management dashboard is incredibly intuitive.',
      avatar: '👩🏾‍⚕️',
    },
  ];

  return (
    <div className="space-y-0">
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden rounded-3xl">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/hospital-hero.jpg"
            alt="Kenyan hospital"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/75 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-6 py-20 md:py-32">
          <div className="max-w-2xl space-y-6">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm text-sm px-4 py-1.5">
              <Activity className="w-3.5 h-3.5 mr-2 animate-pulse" />
              Live Queue Updates — Kenya
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] text-white">
              Skip the Wait.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-green-300">
                Know Before You Go.
              </span>
            </h1>

            <p className="text-xl text-blue-100 max-w-lg leading-relaxed">
              See real-time hospital queue times across Kenya. Book your slot, arrive on time, and get the care you need — without the 4-hour wait.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-lg">
              <div className="flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                  <Input
                    type="text"
                    placeholder="Search hospital or county..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-0 text-white placeholder:text-white/50 focus-visible:ring-white/30 h-12 text-base"
                  />
                </div>
                <Button type="submit" size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 rounded-xl">
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/hospitals">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 rounded-xl h-12 px-6">
                  <HospitalIcon className="w-5 h-5 mr-2" />
                  Find Hospitals
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-xl h-12 px-6 backdrop-blur-sm">
                  <Users className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4 pt-2">
              {['No registration fee', 'Works on any phone', 'All 47 counties'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-blue-200">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating queue card preview */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 w-72 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Live Queue Status</span>
              <span className="flex items-center gap-1.5 text-xs text-green-300">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live
              </span>
            </div>
            {[
              { dept: 'Outpatient (OPD)', count: 8, wait: '40 min', color: 'text-amber-300' },
              { dept: 'Dental Clinic', count: 3, wait: '15 min', color: 'text-green-300' },
              { dept: 'Paediatrics', count: 12, wait: '60 min', color: 'text-red-300' },
            ].map((item) => (
              <div key={item.dept} className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0">
                <div>
                  <p className="text-white text-xs font-medium">{item.dept}</p>
                  <p className="text-white/50 text-xs">{item.count} people waiting</p>
                </div>
                <span className={`text-sm font-bold ${item.color}`}>{item.wait}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-black text-blue-700">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <Badge className="bg-blue-100 text-blue-700 mb-4">Why MediQueue?</Badge>
          <h2 className="text-4xl font-black text-slate-800">Healthcare in Kenya,<br />Made Simple</h2>
          <p className="text-slate-500 mt-3 text-lg">We built MediQueue because we know the pain of waiting. Your time is valuable.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-800">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── FEATURED HOSPITALS ── */}
      {!isLoading && featuredHospitals.length > 0 && (
        <section className="py-16 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <Badge className="bg-green-100 text-green-700 mb-2">Live Now</Badge>
              <h2 className="text-4xl font-black text-slate-800">Featured Hospitals</h2>
              <p className="text-slate-500 mt-1">Real-time queue data updated every minute</p>
            </div>
            <Link to="/hospitals">
              <Button variant="outline" className="group rounded-xl">
                View All Hospitals
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHospitals.map((hospital) =>
              hospital.departments?.slice(0, 1).map((dept: any) => (
                <QueueCard
                  key={`${hospital._id}-${dept._id}`}
                  hospital={hospital}
                  department={dept}
                  queue={dept.queue}
                />
              ))
            )}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <Badge className="bg-purple-100 text-purple-700 mb-4">Simple Process</Badge>
          <h2 className="text-4xl font-black text-slate-800">Get Seen in 3 Steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            { step: '01', icon: Search, title: 'Find Your Hospital', description: 'Search hospitals near you and see live queue times before you even leave home.' },
            { step: '02', icon: Bell, title: 'Book Your Slot', description: 'Select your department, pick a time, and confirm your booking in under 60 seconds.' },
            { step: '03', icon: Zap, title: 'Arrive & Get Seen', description: 'Show up at your scheduled time. No waiting, no guessing — just quality care.' },
          ].map((item, index) => (
            <div key={item.step} className="relative text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                  <item.icon className="w-9 h-9 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-slate-800 text-white text-xs font-black rounded-full flex items-center justify-center">
                  {item.step}
                </span>
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-800">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{item.description}</p>
              {index < 2 && (
                <div className="hidden md:block absolute top-10 left-[65%] w-[30%]">
                  <div className="border-t-2 border-dashed border-blue-200" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 space-y-10">
        <div className="text-center">
          <Badge className="bg-amber-100 text-amber-700 mb-4">Real Stories</Badge>
          <h2 className="text-4xl font-black text-slate-800">Kenyans Love MediQueue</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <span className="text-3xl">{t.avatar}</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{t.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-8">
        <div className="relative rounded-3xl overflow-hidden">
          <img src="/family-healthcare.jpg" alt="Kenyan family healthcare" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-blue-700/80" />
          <div className="relative z-10 p-12 md:p-20 text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-white">Ready to Skip the Wait?</h2>
            <p className="text-blue-200 text-lg">
              Join thousands of Kenyans who are already saving hours every month with MediQueue.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl h-14 px-8 text-base shadow-xl">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Create Free Account
                </Button>
              </Link>
              <Link to="/hospitals">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-xl h-14 px-8 text-base">
                  Browse Hospitals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR HOSPITALS ── */}
      <section className="py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <img src="/waiting-area.jpg" alt="Hospital waiting area Kenya" className="w-full h-72 md:h-96 object-cover" />
        </div>
        <div className="space-y-5">
          <Badge className="bg-blue-100 text-blue-700">For Healthcare Providers</Badge>
          <h2 className="text-4xl font-black text-slate-800">Are You a Hospital Administrator?</h2>
          <p className="text-slate-500 leading-relaxed">
            Join our growing network of Kenyan hospitals. Transform your patient experience, reduce overcrowding, and modernize your operations — starting from KES 2,000/month.
          </p>
          <ul className="space-y-3">
            {[
              'Real-time queue management dashboard',
              'Reduce patient wait times by up to 60%',
              'Automated booking & appointment system',
              'Data-driven insights & daily reports',
              'SMS & WhatsApp patient notifications (coming soon)',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl h-12 px-6 font-semibold">
            Partner With Us
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
