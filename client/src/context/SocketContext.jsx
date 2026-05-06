import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (user) {
      const URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      socketRef.current = io(URL, {
        auth: { token: localStorage.getItem('token') },
        transports: ['websocket'],
      })
      setSocket(socketRef.current)
      return () => {
        socketRef.current?.disconnect()
        setSocket(null)
      }
    }
  }, [user])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
