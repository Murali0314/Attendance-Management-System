import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentData from './pages/StudentData';
import AdminDashboard from './pages/AdminDashboard';
import AdminTeachers from './pages/AdminTeachers';

function PublicLayout({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <nav className="navbar">
        <div className="brand">Attendance Management System</div>
        <button className={"hamburger" + (open ? ' active' : '')} aria-label="Toggle navigation" aria-expanded={open} onClick={()=> setOpen(!open)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className={"nav-links" + (open ? ' open' : '')} onClick={()=> setOpen(false)}>
          <Link to="/">Home</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>
      <div className="container">{children}</div>
    </div>
  );
}

function AppLayout({ children, role, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <nav className="navbar">
        <div className="brand">Attendance Management System</div>
        <button className={"hamburger" + (open ? ' active' : '')} aria-label="Toggle navigation" aria-expanded={open} onClick={()=> setOpen(!open)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className={"nav-links" + (open ? ' open' : '')} onClick={()=> setOpen(false)}>
          <Link to="/">Home</Link>
          {role === 'Teacher' && <Link to="/teacher">Dashboard</Link>}
          {role === 'Teacher' && <Link to="/student-data">Student Data</Link>}
          {role === 'Admin' && <Link to="/admin">Dashboard</Link>}
          {role === 'Admin' && <Link to="/admin-teachers">Teacher Data</Link>}
          <button className="logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>
      <div className="container">{children}</div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = async () => {
    try {
      // optional: call backend to clear cookie
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      // ignore response body; ensure client-side state is cleared
    } catch (e) {
      // ignore network errors for logout
    } finally {
      localStorage.removeItem('role');
      navigate('/');
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          role
            ? (<AppLayout role={role} onLogout={handleLogout}><Home /></AppLayout>)
            : (<PublicLayout><Home /></PublicLayout>)
        }
      />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route
        path="/teacher"
        element={role === 'Teacher' ? (
          <AppLayout role={role} onLogout={handleLogout}><TeacherDashboard /></AppLayout>
        ) : (<Navigate to="/login" />)}
      />
      <Route
        path="/student-data"
        element={role === 'Teacher' ? (
          <AppLayout role={role} onLogout={handleLogout}><StudentData /></AppLayout>
        ) : (<Navigate to="/login" />)}
      />
      <Route
        path="/admin"
        element={role === 'Admin' ? (
          <AppLayout role={role} onLogout={handleLogout}><AdminDashboard /></AppLayout>
        ) : (<Navigate to="/login" />)}
      />
      <Route
        path="/admin-teachers"
        element={role === 'Admin' ? (
          <AppLayout role={role} onLogout={handleLogout}><AdminTeachers /></AppLayout>
        ) : (<Navigate to="/login" />)}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
