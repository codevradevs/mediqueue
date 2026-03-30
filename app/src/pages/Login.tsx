import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Eye, EyeOff, Loader2, Phone, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) { toast.error('Please fill in all fields'); return; }
    try {
      setIsLoading(true);
      await login(phone, password);
      navigate('/');
    } catch {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] grid md:grid-cols-2 gap-0 -mx-4 -my-6">
      {/* Left — image panel */}
      <div className="hidden md:block relative overflow-hidden rounded-l-none">
        <img src="/doctor-kenya.jpg" alt="Kenyan doctor" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-cyan-800/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black">MediQueue</span>
          </div>
          <h2 className="text-3xl font-black leading-tight mb-3">
            Healthcare in Kenya,<br />Without the Wait
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
            See real-time queue times, book appointments, and get the care you need — all from your phone.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { v: '50+', l: 'Hospitals' },
              { v: '10K+', l: 'Bookings/month' },
              { v: '2hrs', l: 'Avg time saved' },
              { v: 'Free', l: 'For patients' },
            ].map((s) => (
              <div key={s.l} className="bg-white/10 backdrop-blur rounded-xl p-3">
                <p className="text-xl font-black">{s.v}</p>
                <p className="text-xs text-blue-200">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MediQueue</span>
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-800">Welcome back</h1>
            <p className="text-slate-500 mt-1">Sign in to your MediQueue account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 0712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-base shadow-lg shadow-blue-200"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Sign In
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient</span>
                <span className="font-mono font-medium">0712345678 / password123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Super Admin</span>
                <span className="font-mono font-medium">0700000000 / admin1234</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
