import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [socket, setSocket] = useState(null);
    const confirmationCallbacksRef = useRef([]);

    useEffect(() => {
        if (isAuthenticated && user) {
            const newSocket = io('http://localhost:3000', {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                newSocket.emit('join-user', user.id);
            });

            newSocket.on('connect_error', (error) => {
                console.error('❌ Error de conexión socket:', error);
            });

            newSocket.on('transaction:confirmed', (data) => {
                showToast(
                    data.message || 'Tu compra ha sido confirmada',
                    'success'
                );

                confirmationCallbacksRef.current.forEach(callback => callback(data));
            });

            setSocket(newSocket);

            return () => {
                newSocket.off('transaction:confirmed');
                newSocket.disconnect();
                setSocket(null);
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user, isAuthenticated]);

    const onTransactionConfirmed = (callback) => {
        confirmationCallbacksRef.current.push(callback);
        
        return () => {
            confirmationCallbacksRef.current = confirmationCallbacksRef.current.filter(
                cb => cb !== callback
            );
        };
    };

    return (
        <SocketContext.Provider value={{ socket, onTransactionConfirmed }}>
            {children}
        </SocketContext.Provider>
    );
};
