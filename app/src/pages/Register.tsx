import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Activity, Eye, EyeOff, Loader2, Phone, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) { toast.error('Please fill in all fields'); return; }
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!agreeTerms) { toast.error('Please agree to the terms'); return; }
    try {
      setIsLoading(true);
      await register(formData.name, formData.phone, formData.password, 'patient');
      navigate('/');
    } catch {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] grid md:grid-cols-2 gap-0 -mx-4 -my-6">
      {/* Left — form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-white order-2 md:order-1">
        <div className="w-full max-w-sm space-y-5">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MediQueue</span>
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-800">Create account</h1>
            <p className="text-slate-500 mt-1">Join thousands of Kenyans skipping the queue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input id="name" name="name" type="text" placeholder="e.g. Wanjiku Kamau"
                  value={formData.name} onChange={handleChange}
                  className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-blue-500" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input id="phone" name="phone" type="tel" placeholder="e.g. 0712 345 678"
                  value={formData.phone} onChange={handleChange}
                  className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-blue-500" required />
              </div>
              <p className="text-xs text-slate-400">Used for appointment reminders</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters" value={formData.password} onChange={handleChange}
                  className="pl-10 pr-10 h-12 rounded-xl border-slate-200 focus-visible:ring-blue-500" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange}
                  className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-blue-500" required />
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Checkbox id="terms" checked={agreeTerms}
                onCheckedChange={(c) => setAgreeTerms(c as boolean)} className="mt-0.5" />
              <Label htmlFor="terms" className="text-sm font-normal text-slate-600 cursor-pointer leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </Label>
            </div>

            <Button type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-base shadow-lg shadow-blue-200"
              disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Create Free Account
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right — image panel */}
      <div className="hidden md:block relative overflow-hidden order-1 md:order-2">
        <img src="/family-healthcare.jpg" alt="Kenyan family healthcare" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-bl from-cyan-900/80 to-blue-900/70" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black">MediQueue</span>
          </div>
          <h2 className="text-3xl font-black leading-tight mb-3">
            Your Health,<br />Your Schedule
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs mb-6">
            Stop spending your whole day at the hospital. MediQueue puts you in control of your healthcare journey.
          </p>
          <div className="space-y-2.5">
            {[
              'Free to join — no hidden charges',
              'Works on any smartphone',
              'Available across all 47 counties',
              'Real-time queue updates',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
