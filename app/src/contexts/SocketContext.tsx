import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { SocketContextType } from '../types';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Socket connects to the server root, not /api
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  .replace('/api', '');

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, []);

  const joinDepartment  = (id: string) => socket?.emit('join_department', id);
  const leaveDepartment = (id: string) => socket?.emit('leave_department', id);
  const joinHospital    = (id: string) => socket?.emit('join_hospital', id);
  const leaveHospital   = (id: string) => socket?.emit('leave_hospital', id);

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinDepartment, leaveDepartment, joinHospital, leaveHospital }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
