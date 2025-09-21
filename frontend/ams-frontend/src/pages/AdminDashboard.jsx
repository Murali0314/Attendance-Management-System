import { useEffect, useState } from 'react';
import { Admin, Attendance } from '../api';

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [subject, setSubject] = useState('Python');
  const [section, setSection] = useState('Section A');
  const [students, setStudents] = useState([]);
  const [rows, setRows] = useState([]); // from Attendance.get
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    // keep placeholder for potential future admin data loads
  };

  const fetchStudents = async () => {
    setLoading(true);
    const s = await Admin.students({ subject, section });
    setStudents(s.data.data || []);
    const a = await Attendance.get({ subject, section });
    const d = a.data.data || {};
    setDates(d.datesInWeek || []);
    setRows(d.students || []);
    setLoading(false);
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <br></br>
          <br></br>
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="page-subtitle">View students and their attendance percentages</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ textAlign: 'left', marginTop: 0 }}>Students</h3>
        <div className="filters responsive-filters">
          <div className="filter-group">
            <label>Subject</label>
            <select value={subject} onChange={(e)=>setSubject(e.target.value)}>
              {['Python','Java','Full Stack','DBMS','AIML'].map((s)=>(<option key={s}>{s}</option>))}
            </select>
          </div>
          <div className="filter-group">
            <label>Section</label>
            <select value={section} onChange={(e)=>setSection(e.target.value)}>
              {['Section A','Section B','Section C'].map((s)=>(<option key={s}>{s}</option>))}
            </select>
          </div>
          <button className="primary" onClick={fetchStudents}>Fetch Students</button>
        </div>

        <div className="table-wrap">
          {loading ? <p>Loading...</p> : (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Weekly %</th>
                  <th>Total %</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center' }}>No students loaded. Choose filters and fetch.</td></tr>
                ) : students.map((s)=> {
                  const r = rows.find(x=> x.student._id === s._id);
                  return (
                    <tr key={s._id}>
                      <td>{s.rollNo}</td>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td><span className="badge badge-soft">{s.subject}</span></td>
                      <td><span className="badge badge-soft">{s.section}</span></td>
                      <td><span className={"badge " + ((r?.weeklyPct||0) >= 75 ? 'badge-success' : 'badge-warn')}>{r ? r.weeklyPct : 0}%</span></td>
                      <td><span className={"badge " + ((r?.totalPct||0) >= 75 ? 'badge-success' : 'badge-warn')}>{r ? r.totalPct : 0}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}



