export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'patient' | 'admin' | 'super_admin';
  hospitalId?: string;
}

export interface Hospital {
  _id: string;
  name: string;
  description?: string;
  location: {
    address: string;
    city: string;
    county: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  image?: string;
  isActive: boolean;
  operatingHours?: {
    [key: string]: { open: string; close: string };
  };
  departments?: Department[];
  createdAt: string;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  hospitalId: string;
  avgServiceTime: number;
  maxCapacity: number;
  isActive: boolean;
  queue?: Queue;
  createdAt: string;
}

export interface Queue {
  _id: string;
  departmentId: string;
  hospitalId: string;
  currentCount: number;
  totalServedToday: number;
  lastUpdated: string;
  updatedBy?: string;
  status: 'open' | 'closed' | 'paused';
  estimatedWait?: number;
  departmentName?: string;
  avgServiceTime?: number;
}

export interface Booking {
  _id: string;
  userId: string;
  hospitalId: string | Hospital;
  departmentId: string | Department;
  scheduledTime: string;
  queueNumber?: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  symptoms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface SocketContextType {
  socket: any;
  isConnected: boolean;
  joinDepartment: (departmentId: string) => void;
  leaveDepartment: (departmentId: string) => void;
  joinHospital: (hospitalId: string) => void;
  leaveHospital: (hospitalId: string) => void;
}
