import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ExamPage from './pages/ExamPage'

function PrivateRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  if (!token) return <Navigate to="/" />
  if (allowedRole && role !== allowedRole) return <Navigate to="/" />
  return children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={
          <PrivateRoute allowedRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/student" element={
          <PrivateRoute allowedRole="student">
            <StudentDashboard />
          </PrivateRoute>
        } />
        <Route path="/exam/:id" element={
          <PrivateRoute>
            <ExamPage />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App