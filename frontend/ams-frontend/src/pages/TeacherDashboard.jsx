import { useEffect, useMemo, useState } from 'react';
import { Attendance, Students } from '../api';

const SUBJECTS = ['Python', 'Java', 'Full Stack', 'DBMS', 'AIML'];
const SECTIONS = ['Section A', 'Section B', 'Section C'];

export default function TeacherDashboard() {
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [rows, setRows] = useState([]); // {student, days, weeklyPct, totalPct}
  const [dates, setDates] = useState([]); // week dates
  const [todayMap, setTodayMap] = useState({}); // studentId -> boolean present
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  // Use local date (YYYY-MM-DD) to match backend dayjs().format('YYYY-MM-DD')
  const todayStr = useMemo(()=> new Date().toLocaleDateString('en-CA'), []);
  const [todayLocked, setTodayLocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setMsg('');
    try {
      const ares = await Attendance.get({ subject, section });
      const d = ares.data.data || {};
      setDates(d.datesInWeek || []);
      const studentsData = d.students || [];
      setRows(studentsData);
      // Initialize today's selections from existing records (so reopening shows yesterday/today symbols)
      const map = {};
      const todayIdx = (d.datesInWeek || []).findIndex((dt)=> dt === todayStr);
      if (todayIdx !== -1) {
        for (const r of studentsData) {
          const v = r.days[todayIdx];
          if (v === 'Present') map[r.student._id] = true;
          else if (v === 'Absent') map[r.student._id] = false;
        }
      }
      setTodayMap(map);
      // Use backend-provided locking state, fallback to presence of saved values for today
      let lockedFromBackend = false;
      if (d.lockedByDate && Object.prototype.hasOwnProperty.call(d.lockedByDate, todayStr)) {
        lockedFromBackend = !!d.lockedByDate[todayStr];
      }
      const anySavedForToday = todayIdx !== -1 && studentsData.some(r => r.days[todayIdx] === 'Present' || r.days[todayIdx] === 'Absent');
      setTodayLocked(lockedFromBackend || anySavedForToday);
    } catch (e) {
      setMsg(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if(subject && section){ fetchData(); } }, [subject, section]);

  const saveToday = async () => {
    if (todayLocked || saving) return;
    setSaving(true);
    try {
      const records = rows.map((r)=> ({ studentId: r.student._id, status: todayMap[r.student._id] ? 'Present' : 'Absent' }));
      const res = await Attendance.save({ subject, section, records });
      setMsg(res.data.message);
      setTodayLocked(true);
      fetchData();
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      setMsg(errMsg);
      // If backend says locked, reflect that state immediately
      if ((e.response?.status === 400) || /locked/i.test(errMsg)) {
        setTodayLocked(true);
      }
    }
    finally { setSaving(false); }
  };

  return (
    <div className="page teacher-page teacher-bg2">
      <h2 className="td-title2">Teacher Dashboard</h2>
      <div className="card dashboard-card td-card1b">
        <h4 className="section-title">Subjects</h4>
        <div className="chip-grid subjects-grid">
          {SUBJECTS.map((s)=> (
            <button key={s} className={s===subject? 'chip active':'chip'} onClick={()=>{ setSubject(s); setSection(''); setRows([]); setDates([]); }}>{s}</button>
          ))}
        </div>
      </div>
      {subject && (
        <div className="card dashboard-card td-card2b">
          <h4 className="section-title">Sections</h4>
          <div className="chip-grid sections-grid">
            {SECTIONS.map((s)=> (
              <button key={s} className={s===section? 'chip active':'chip'} onClick={()=>setSection(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {subject && section && (
        <div className="card dashboard-card td-card3b">
          <h3 className="section-title">Attendance Table - {subject?.toUpperCase()}-{section?.split(' ')[1]?.toUpperCase()}</h3>
          {!subject && <p>Select a subject to begin.</p>}
          {subject && !section && <p>Select a section for {subject}.</p>}
          {subject && section && (loading ? <p>Loading...</p> : (
            <div className="table-wrap td-table-wrap">
              <table className="td-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Email</th>
                    {dates.map((d)=> <th key={d}>{d.slice(5)}</th>)}
                    <th>Weekly %</th>
                    <th>Total %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={6}>No students found.</td></tr>
                  )}
                  {rows.map((r, idx)=> (
                    <tr key={r.student._id} className={idx % 2 === 0 ? 'td-row-even2' : 'td-row-odd2'}>
                      <td>{editingId===r.student._id ? (<input value={r.student.rollNo} onChange={(e)=>{
                            const v = e.target.value; setRows(rows.map(x=> x.student._id===r.student._id? ({...x, student:{...x.student, rollNo:v}}):x));
                          }} />) : r.student.rollNo}</td>
                      <td>{editingId===r.student._id ? (<input value={r.student.name} onChange={(e)=>{
                            const v = e.target.value; setRows(rows.map(x=> x.student._id===r.student._id? ({...x, student:{...x.student, name:v}}):x));
                          }} />) : r.student.name}</td>
                      <td>{editingId===r.student._id ? (<input value={r.student.email} onChange={(e)=>{
                            const v = e.target.value; setRows(rows.map(x=> x.student._id===r.student._id? ({...x, student:{...x.student, email:v}}):x));
                          }} />) : r.student.email}</td>
                      {dates.map((d, idx)=> {
                        const isToday = d === todayStr; // enable only the actual current date
                        const isEditable = isToday && !todayLocked;
                        const val = r.days[idx];
                        const symbol = val === 'Present' ? '✓' : (val === 'Absent' ? '✗' : '');
                        const state = todayMap[r.student._id]; // undefined | true | false
                        return (
                          <td key={d}
                            style={{ textAlign: 'center', userSelect: 'none', opacity: isEditable ? 1 : 0.7 }}
                            onDoubleClick={isEditable ? ()=> setTodayMap({ ...todayMap, [r.student._id]: false }) : undefined}
                            title={isEditable ? 'Click = Present (✓), Double-click = Absent (✗)' : (isToday ? 'Attendance locked' : '')}
                          >
                            {isToday ? (
                              state === false ? '✗' : (
                                <input
                                  type="checkbox"
                                  checked={state === true}
                                  disabled={!isEditable}
                                  onChange={(e)=> setTodayMap({ ...todayMap, [r.student._id]: e.target.checked ? true : undefined })}
                                />
                              )
                            ) : symbol}
                          </td>
                        );
                      })}
                      <td>{r.weeklyPct}%</td>
                      <td>{r.totalPct}%</td>
                      <td>
                        <div className="td-action-icons">
                          {editingId===r.student._id ? (
                            <>
                              <span className="icon-btn" title="Save" onClick={async ()=>{
                                await Students.update(r.student._id, { rollNo:Number(r.student.rollNo), name:r.student.name, email:r.student.email });
                                setEditingId(null);
                              }}>💾</span>
                              <span className="icon-btn" title="Cancel" onClick={()=> setEditingId(null)}>✖️</span>
                            </>
                          ) : (
                            <>
                              <span className="icon-btn" title="Edit" onClick={()=> setEditingId(r.student._id)}>✎</span>
                              <span className="icon-btn" title="Delete" style={{ color: '#ef4444' }} onClick={async ()=>{
                                if(confirm('Delete this student?')){ await Students.remove(r.student._id); setRows(rows.filter(x=> x.student._id!==r.student._id)); }
                              }}>🗑</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={saveToday} className="primary"   disabled={todayLocked || saving}>{saving? 'Saving...' : (todayLocked? 'Locked' : 'Save Attendance')}</button>
              {msg && <p>{msg}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


