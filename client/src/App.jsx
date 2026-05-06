import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ToastProvider } from './components/Toast'
import Navbar        from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Landing    from './pages/Landing'
import Login      from './pages/Login'
import Register   from './pages/Register'
import Home       from './pages/Home'
import NewPost    from './pages/NewPost'
import PostDetail from './pages/PostDetail'
import MyPosts    from './pages/MyPosts'
import Chat       from './pages/Chat'
import Profile    from './pages/Profile'
import NotFound   from './pages/NotFound'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
        <Route path="/login"    element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/home" replace /> : <Register />} />

        {/* Protected */}
        <Route path="/home"      element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/new-post"  element={<ProtectedRoute><NewPost /></ProtectedRoute>} />
        <Route path="/my-posts"  element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/posts/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
        <Route path="/chat/:matchId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
