import { useEffect, useState } from 'react';
import { Students } from '../api';
import Toast from '../components/Toast';

export default function StudentData() {
  const [form, setForm] = useState({ rollNo: '', name: '', email: '', subject: 'Python', section: 'Section A' });
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await Students.add({ ...form, rollNo: Number(form.rollNo) });
      setMsg(res.data.message);
      setToast('Student added successfully!');
    } catch (e) {
      setMsg(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="student-data-page">
      <div className="card form-card colorful">
        <h2>Add Student</h2>
      <form onSubmit={onSubmit}>
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} />
        <input name="rollNo" placeholder="Roll No" value={form.rollNo} onChange={onChange} />
        <select name="subject" value={form.subject} onChange={onChange}>
          {['Python','Java','Full Stack','DBMS','AIML'].map((s)=> <option key={s}>{s}</option>)}
        </select>
        <select name="section" value={form.section} onChange={onChange}>
          {['Section A','Section B','Section C'].map((s)=> <option key={s}>{s}</option>)}
        </select>
        <button type="submit" className="primary">Add Student</button>
      </form>
        {msg && <p>{msg}</p>}
      </div>
      <Toast message={toast} onClose={()=> setToast('')} />
    </div>
  );
}



