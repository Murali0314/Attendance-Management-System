import { useState } from 'react';
import { Auth } from '../api';
import Toast from '../components/Toast';

const subjects = ['Python', 'Java', 'Full Stack', 'DBMS', 'AIML'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Teacher', subject: 'Python' });
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await Auth.register(form);
      setMsg(res.data.message);
      setToast('Successfully registered!');
    } catch (e) {
      setMsg(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="auth-page auth-register">
      <div className="card form-card colorful">
        <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} />
        <select name="role" value={form.role} onChange={onChange}>
          <option>Admin</option>
          <option>Teacher</option>
        </select>
        {form.role === 'Teacher' && (
          <select name="subject" value={form.subject} onChange={onChange}>
            {subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
        )}
          <button type="submit" className="primary">Register</button>
      </form>
        {msg && <p>{msg}</p>}
      </div>
      <Toast message={toast} onClose={()=> setToast('')} />
    </div>
  );
}



