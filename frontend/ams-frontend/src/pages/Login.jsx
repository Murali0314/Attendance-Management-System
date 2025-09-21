import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../api';
import Toast from '../components/Toast';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Teacher');
  const [subject, setSubject] = useState('Python');
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await Auth.login({ email, password });
      setMsg(res.data.message);
      const data = res.data?.data || {};
      if (data.role) {
        localStorage.setItem('role', data.role);
      }
      if (data.role === 'Admin') {
        navigate('/admin');
      } else if (data.role === 'Teacher') {
        navigate('/teacher');
      }
      setToast('Login successful!');
    } catch (e) {
      setMsg(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="auth-page auth-login">
      <div className="card form-card colorful">
        <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <select value={role} onChange={(e)=>setRole(e.target.value)}>
          <option>Admin</option>
          <option>Teacher</option>
        </select>
        {role === 'Teacher' && (
          <select value={subject} onChange={(e)=>setSubject(e.target.value)}>
            {['Python','Java','Full Stack','DBMS','AIML'].map((s)=> <option key={s}>{s}</option>)}
          </select>
        )}
          <button type="submit" className="primary">Login</button>
      </form>
        {msg && <p>{msg}</p>}
      </div>
      <Toast message={toast} onClose={()=> setToast('')} />
    </div>
  );
}


