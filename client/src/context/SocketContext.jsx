import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const PROD_URL = 'https://arlyon.onrender.com';
      const token = localStorage.getItem('arlyon_token');
      const envUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : null;
      const serverUrl = envUrl || (import.meta.env.MODE === 'production' ? PROD_URL : window.location.origin);
      
      const newSocket = io(serverUrl, {
        auth: { token },
        query: { userId: user._id }
      });
      setSocket(newSocket);
      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
