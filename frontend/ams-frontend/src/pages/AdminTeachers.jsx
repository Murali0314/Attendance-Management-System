import { useEffect, useState } from 'react';
import { Admin } from '../api';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '' });
  const [msg, setMsg] = useState('');

  const load = async () => {
    const t = await Admin.teachers();
    setTeachers(t.data.data || []);
  };

  useEffect(()=>{ load(); }, []);

  const startEdit = (t) => {
    setEditingId(t._id);
    setForm({ name: t.name || '', email: t.email || '', subject: t.subject || '' });
  };

  const saveEdit = async () => {
    await Admin.updateTeacher(editingId, form);
    setEditingId(null);
    setMsg('Updated');
    load();
  };

  const remove = async (id) => {
    if (confirm('Delete this teacher?')) {
      await Admin.deleteTeacher(id);
      setTeachers(teachers.filter(t => t._id !== id));
    }
  };

  return (
    <div>
      <h2>Teacher Data</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={t._id}>
                <td>{i + 1}</td>
                <td>{editingId === t._id ? (<input value={form.name} onChange={(e)=> setForm({ ...form, name: e.target.value })} />) : t.name}</td>
                <td>{editingId === t._id ? (<input value={form.email} onChange={(e)=> setForm({ ...form, email: e.target.value })} />) : t.email}</td>
                <td>{editingId === t._id ? (
                  <select value={form.subject} onChange={(e)=> setForm({ ...form, subject: e.target.value })}>
                    {['Python','Java','Full Stack','DBMS','AIML'].map((s)=>(<option key={s}>{s}</option>))}
                  </select>
                ) : t.subject}
                </td>
                <td>
                  {editingId === t._id ? (
                    <>
                      <button className="chip" onClick={saveEdit}>💾</button>
                      <button className="chip" style={{ marginLeft: 8 }} onClick={()=> setEditingId(null)}>✖️</button>
                    </>
                  ) : (
                    <>
                      <button className="chip" onClick={()=> startEdit(t)}>✎</button>
                      <button className="chip" style={{ marginLeft: 8, color: '#ef4444', borderColor: '#fecaca' }} onClick={()=> remove(t._id)}>🗑</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
}


