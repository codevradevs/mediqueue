import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Hospitals from './pages/Hospitals';
import HospitalDetail from './pages/HospitalDetail';
import Bookings from './pages/Bookings';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminQueue from './pages/AdminQueue';
import AdminBookings from './pages/AdminBookings';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="container mx-auto px-4 py-6 max-w-7xl">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/hospitals" element={<Hospitals />} />
                <Route path="/hospitals/:id" element={<HospitalDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Patient */}
                <Route path="/bookings" element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <Bookings />
                  </ProtectedRoute>
                } />

                {/* Admin */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/queue" element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <AdminQueue />
                  </ProtectedRoute>
                } />
                <Route path="/admin/bookings" element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <AdminBookings />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Toaster position="top-right" richColors closeButton />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
