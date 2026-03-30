import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Menu, X, Hospital, Calendar, User, LogOut,
  LayoutDashboard, Users, Activity, ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Activity },
    { path: '/hospitals', label: 'Hospitals', icon: Hospital },
  ];

  const patientLinks = [{ path: '/bookings', label: 'My Bookings', icon: Calendar }];

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/queue', label: 'Queue', icon: Users },
    { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                MediQueue
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium tracking-wide">KENYA</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-lg font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <link.icon className="w-4 h-4 mr-1.5" />
                  {link.label}
                </Button>
              </Link>
            ))}

            {user?.role === 'patient' && patientLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-lg font-medium ${
                    isActive(link.path) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <link.icon className="w-4 h-4 mr-1.5" />
                  {link.label}
                </Button>
              </Link>
            ))}

            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-lg font-medium ${
                    location.pathname.startsWith('/admin') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  Admin
                </Button>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-xl hover:bg-slate-100 pr-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-slate-800 leading-none">{user.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-xl shadow-xl border-slate-200 p-1">
                  <div className="px-3 py-2.5 mb-1">
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.phone}</p>
                    <Badge className="mt-1.5 text-xs bg-blue-100 text-blue-700 border-0 capitalize">
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />

                  {isAdmin && (
                    <>
                      {adminLinks.map((link) => (
                        <DropdownMenuItem key={link.path} asChild>
                          <Link to={link.path} className="flex items-center gap-2 rounded-lg cursor-pointer">
                            <link.icon className="w-4 h-4 text-slate-500" />
                            {link.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {user.role === 'patient' && patientLinks.map((link) => (
                    <DropdownMenuItem key={link.path} asChild>
                      <Link to={link.path} className="flex items-center gap-2 rounded-lg cursor-pointer">
                        <link.icon className="w-4 h-4 text-slate-500" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer mt-1"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="rounded-lg font-medium text-slate-600">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-sm hover:shadow-md transition-shadow">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start rounded-lg ${isActive(link.path) ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Button>
              </Link>
            ))}
            {user?.role === 'patient' && patientLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start rounded-lg ${isActive(link.path) ? 'bg-blue-50 text-blue-700' : ''}`}>
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Button>
              </Link>
            ))}
            {isAdmin && adminLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start rounded-lg ${isActive(link.path) ? 'bg-blue-50 text-blue-700' : ''}`}>
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Button>
              </Link>
            ))}
            {!user && (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-lg">
                  <User className="w-4 h-4 mr-2" /> Sign In
                </Button>
              </Link>
            )}
            {user && (
              <Button
                variant="ghost"
                className="w-full justify-start rounded-lg text-red-600 hover:bg-red-50"
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
