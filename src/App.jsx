import React, { useState, useEffect } from 'react';
import './App.css';

// ==========================================
// 1. หน้าจอ Login / Register
// ==========================================
function AuthScreen({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/${isLoginMode ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else if (isLoginMode) onLogin(data.user);
      else { alert('✅ สมัครสมาชิกสำเร็จ! กรุณาล็อกอิน'); setIsLoginMode(true); }
    } catch { alert('❌ เชื่อมต่อ Backend ไม่ได้'); }
  };

  return (
    <div style={styles.authBox}>
      <h2 style={{ color: '#1a237e', marginBottom: '30px' }}>🛡️ IRAC Durian DSS</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!isLoginMode && <input type="text" placeholder="ชื่อ-นามสกุล" style={styles.input} onChange={e => setForm({...form, name: e.target.value})} required />}
        <input type="text" placeholder="Username" style={styles.input} onChange={e => setForm({...form, username: e.target.value})} required />
        <input type="password" placeholder="Password" style={styles.input} onChange={e => setForm({...form, password: e.target.value})} required />
        <button type="submit" style={styles.mainBtn}>{isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button>
      </form>
      <p style={{ cursor: 'pointer', marginTop: '20px', color: '#1a237e' }} onClick={() => setIsLoginMode(!isLoginMode)}>
        {isLoginMode ? 'ยังไม่มีบัญชี? สมัครที่นี่' : 'มีบัญชีแล้ว? กลับไปล็อกอิน'}
      </p>
    </div>
  );
}

// ==========================================
// 2. ส่วนหน้าปฏิทินและการนัดหมาย (Smart Calendar & Appointments)
// ==========================================
function CalendarView({ user, pests }) {
  const [currentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [newAppt, setNewAppt] = useState({ date: '', pest_id: '', note: '' });

  // ข้อมูลความเสี่ยงรายเดือนตามหลักวิชาการ
  const calendarData = [
    { months: [10, 11, 0, 1], range: 'พ.ย. - ก.พ.', stage: 'ระยะออกดอก', risk: 'เพลี้ยไฟ, ไรแดง, หนอนกินดอก', tip: 'พ่นป้องกันช่วงดอกตูม ควบคุมความชื้นสวน' },
    { months: [2, 3, 4], range: 'มี.ค. - พ.ค.', stage: 'ระยะพัฒนาผล', risk: 'หนอนเจาะผล, หนอนเจาะเมล็ด, เพลี้ยแป้ง', tip: 'ตรวจสอบผลทุเรียนทุกสัปดาห์ พ่นยาตามรอบ' },
    { months: [5, 6, 7, 8, 9], range: 'มิ.ย. - ต.ค.', stage: 'ฤดูฝน / ฟื้นต้น', risk: 'รากเน่าโคนเน่า, โรคใบติด, เพลี้ยไก่แจ้', tip: 'ระบายน้ำออกจากโคน ปรับค่า pH ดินด้วยปูนขาว' }
  ];

  const currentMonth = currentDate.getMonth();
  const currentRisk = calendarData.find(item => item.months.includes(currentMonth));

  // ดึงข้อมูลนัดหมาย (จำลองการดึงจาก API หรือ LocalStorage)
  useEffect(() => {
    const saved = localStorage.getItem(`appt_${user.id}`);
    if (saved) setAppointments(JSON.parse(saved));
  }, [user.id]);

  const handleAddAppt = (e) => {
    e.preventDefault();
    if (!newAppt.date || !newAppt.pest_id) return alert('กรุณาระบุวันที่และอาการ');
    const updated = [...appointments, { ...newAppt, id: Date.now() }];
    setAppointments(updated);
    localStorage.setItem(`appt_${user.id}`, JSON.stringify(updated));
    setNewAppt({ date: '', pest_id: '', note: '' });
  };

  const deleteAppt = (id) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    localStorage.setItem(`appt_${user.id}`, JSON.stringify(updated));
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} style={styles.calDayEmpty}></div>);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasAppt = appointments.some(a => a.date === dateStr);
      const isToday = d === currentDate.getDate();
      
      days.push(
        <div key={d} style={{ 
          ...styles.calDay, 
          backgroundColor: isToday ? '#1a237e' : 'white', 
          color: isToday ? 'white' : '#333',
          position: 'relative'
        }}>
          {d}
          {hasAppt && <div style={styles.apptDot}></div>}
        </div>
      );
    }
    return days;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Smart Warning */}
      {currentRisk && (
        <div style={{ ...styles.card, borderLeft: '10px solid #d32f2f', backgroundColor: '#fff5f5' }}>
          <h3 style={{ color: '#d32f2f', marginTop: 0 }}>📢 แจ้งเตือน: ช่วงเดือน{currentRisk.range}</h3>
          <p>ต้องระวัง: <b style={{ color: '#b71c1c' }}>{currentRisk.risk}</b></p>
          <small>💡 คำแนะนำ: {currentRisk.tip}</small>
        </div>
      )}

      <div style={styles.calendarLayout}>
        {/* ปฏิทิน */}
        <div style={styles.card}>
          <h4 style={{ textAlign: 'center' }}>{currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</h4>
          <div style={styles.calendarGrid}>
            {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => <div key={d} style={styles.calHeader}>{d}</div>)}
            {renderCalendarDays()}
          </div>
        </div>

        {/* ฟอร์มเพิ่มนัดหมาย */}
        <div style={styles.card}>
          <h4 style={{ marginTop: 0 }}>📝 เพิ่มนัดหมายฉีดพ่น</h4>
          <form onSubmit={handleAddAppt} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="date" style={styles.input} value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
            <select style={styles.input} value={newAppt.pest_id} onChange={e => setNewAppt({...newAppt, pest_id: e.target.value})}>
              <option value="">-- เลือกโรค/ศัตรูพืช --</option>
              {pests.map(p => <option key={p.pest_id} value={p.pest_id}>{p.pest_name}</option>)}
            </select>
            <textarea placeholder="บันทึกเพิ่มเติม" style={styles.input} value={newAppt.note} onChange={e => setNewAppt({...newAppt, note: e.target.value})} />
            <button type="submit" style={{ ...styles.mainBtn, backgroundColor: '#2e7d32' }}>บันทึกแผนงาน</button>
          </form>
        </div>
      </div>

      {/* ตารางนัดหมายการฉีดพ่น */}
      <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>📅 ตารางนัดหมายการฉีดพ่น</h4>
        <table style={styles.table}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={styles.th}>วันที่นัด</th>
              <th style={styles.th}>เป้าหมายการฉีด</th>
              <th style={styles.th}>หมายเหตุ</th>
              <th style={styles.th}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? appointments.sort((a,b) => new Date(a.date) - new Date(b.date)).map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={styles.td}>{new Date(a.date).toLocaleDateString('th-TH')}</td>
                <td style={styles.td}>{pests.find(p => p.pest_id == a.pest_id)?.pest_name}</td>
                <td style={styles.td}>{a.note || '-'}</td>
                <td style={styles.td}><button onClick={() => deleteAppt(a.id)} style={styles.deleteBtn}>ลบ</button></td>
              </tr>
            )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>ยังไม่มีนัดหมาย</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 3. หน้ารายงานสถิติ (Stats View)
// ==========================================
function StatsView({ userId, history }) {
  const [stats, setStats] = useState([]);
  useEffect(() => {
    if(userId) fetch(`http://localhost:3000/api/stats/${userId}`).then(res => res.json()).then(data => setStats(data));
  }, [userId, history]);
  const total = stats.reduce((acc, curr) => acc + curr.count, 0);
  const maxCount = Math.max(...stats.map(s => s.count), 1);
  return (
    <div style={styles.card}>
      <h4 style={{ marginTop: 0 }}>📊 สรุปการใช้ยากลุ่มต่างๆ (รวม {total} ครั้ง)</h4>
      {stats.map((s, i) => (
        <div key={i} style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}><span>{s.g_name}</span><strong>{s.count} ครั้ง</strong></div>
          <div style={styles.progressBg}><div style={{ ...styles.progressFill, width: `${(s.count / maxCount) * 100}%`, backgroundColor: s.count >= 3 ? '#ff5252' : '#4caf50' }}></div></div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 4. หน้าจอหลัก (MainApp)
// ==========================================
function MainApp({ user }) {
  const [view, setView] = useState('record');
  const [pests, setPests] = useState([]);
  const [selectedPest, setSelectedPest] = useState(null);
  const [moaGroups, setMoaGroups] = useState([]);
  const [history, setHistory] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchHistory = () => {
    if (user?.id) fetch(`http://localhost:3000/api/history/${user.id}`).then(res => res.json()).then(data => setHistory(data));
  };

  useEffect(() => {
    fetch('http://localhost:3000/api/pests').then(res => res.json()).then(data => setPests(data));
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (selectedPest) fetch(`http://localhost:3000/api/moa/${selectedPest}`).then(res => res.json()).then(data => setMoaGroups(data));
  }, [selectedPest]);

  const handleRecord = async (gId, gName) => {
    const pest = pests.find(p => p.pest_id === selectedPest);
    const latest = history.find(h => h.pest_name === pest?.pest_name);
    if (latest && latest.g_name === gName) if (!window.confirm(`⚠️ เตือนดื้อยา! ยืนยันใช้ยากลุ่มเดิมซ้ำหรือไม่?`)) return;
    const res = await fetch('http://localhost:3000/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, pest_id: selectedPest, g_id: gId })
    });
    if (res.ok) { fetchHistory(); alert('✅ บันทึกสำเร็จ'); }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('🗑️ ลบรายการประวัติ?')) return;
    const res = await fetch(`http://localhost:3000/api/history/${logId}`, { method: 'DELETE' });
    if (res.ok) { fetchHistory(); alert('✅ ลบสำเร็จ'); }
  };

  const filteredPests = pests.filter(p => categoryFilter === 'all' || p.category === categoryFilter);
  const currentPest = pests.find(p => p.pest_id === selectedPest);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      <div style={styles.header}>
        <h3>คุณ {user.name} 🌳</h3>
        <div style={styles.tabBox}>
          <button onClick={() => setView('record')} style={{ ...styles.tabBtn, backgroundColor: view === 'record' ? '#1a237e' : 'white', color: view === 'record' ? 'white' : '#333' }}>บันทึก</button>
          <button onClick={() => setView('stats')} style={{ ...styles.tabBtn, backgroundColor: view === 'stats' ? '#1a237e' : 'white', color: view === 'stats' ? 'white' : '#333' }}>สถิติ</button>
          <button onClick={() => setView('calendar')} style={{ ...styles.tabBtn, backgroundColor: view === 'calendar' ? '#1a237e' : 'white', color: view === 'calendar' ? 'white' : '#333' }}>ปฏิทิน</button>
        </div>
      </div>

      {view === 'record' && (
        <>
          <div style={styles.card}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setCategoryFilter('all')} style={{ ...styles.filterBtn, backgroundColor: categoryFilter === 'all' ? '#1a237e' : '#eee', color: categoryFilter === 'all' ? 'white' : '#333' }}>ทั้งหมด</button>
              <button onClick={() => setCategoryFilter('pest')} style={{ ...styles.filterBtn, backgroundColor: categoryFilter === 'pest' ? '#d32f2f' : '#eee', color: categoryFilter === 'pest' ? 'white' : '#333' }}>🐛 แมลง</button>
              <button onClick={() => setCategoryFilter('disease')} style={{ ...styles.filterBtn, backgroundColor: categoryFilter === 'disease' ? '#7b1fa2' : '#eee', color: categoryFilter === 'disease' ? 'white' : '#333' }}>🍄 โรค</button>
            </div>
            <div style={styles.pestGrid}>
              {filteredPests.map(p => (
                <div key={p.pest_id} onClick={() => setSelectedPest(p.pest_id)} style={{ ...styles.pestCard, borderColor: selectedPest === p.pest_id ? '#1a237e' : '#eee' }}>
                  <img src={p.image_url} alt={p.pest_name} style={styles.pestImgSmall} onError={e => e.target.src='https://via.placeholder.com/150'} />
                  <div style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>{p.pest_name}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedPest && currentPest && (
            <div style={{ ...styles.card, borderLeft: '8px solid #fbc02d', backgroundColor: '#fffbe6' }}>
              <div style={styles.detailFlex}>
                <img src={currentPest.image_url} alt={currentPest.pest_name} style={styles.detailImgLarge} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginTop: 0 }}>{currentPest.pest_name}</h3>
                  <p style={{ fontSize: '14px' }}>{currentPest.description}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {moaGroups.map(moa => (
                      <div key={moa.g_id} style={styles.moaCard}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{moa.g_name}</div>
                        <button onClick={() => handleRecord(moa.g_id, moa.g_name)} style={styles.recordBtn}>บันทึกใช้ยานี้</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={styles.card}>
            <h4 style={{ marginTop: 0 }}>📅 ประวัติการจัดการ</h4>
            <table style={styles.table}>
              <thead><tr style={{ backgroundColor: '#f8f9fa' }}><th style={styles.th}>วันที่</th><th style={styles.th}>อาการ</th><th style={styles.th}>กลุ่มยา</th><th style={styles.th}>จัดการ</th></tr></thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={styles.td}>{new Date(h.usage_date).toLocaleDateString('th-TH')}</td>
                    <td style={styles.td}>{h.pest_name}</td>
                    <td style={styles.td}><span style={styles.tag}>{h.g_name}</span></td>
                    <td style={styles.td}><button onClick={() => handleDelete(h.log_id)} style={styles.deleteBtn}>ลบ</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'stats' && <StatsView userId={user.id} history={history} />}
      {view === 'calendar' && <CalendarView user={user} pests={pests} />}
    </div>
  );
}

// ==========================================
// 5. Styles
// ==========================================
const styles = {
  authBox: { padding: '50px', maxWidth: '380px', margin: '100px auto', backgroundColor: 'white', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '10px', width: '100%' },
  mainBtn: { padding: '12px 30px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  tabBox: { display: 'flex', gap: '5px', backgroundColor: '#eee', padding: '5px', borderRadius: '12px' },
  tabBtn: { border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', marginBottom: '20px' },
  filterBtn: { padding: '8px 20px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
  pestGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' },
  pestCard: { border: '2px solid #eee', borderRadius: '15px', overflow: 'hidden', cursor: 'pointer', textAlign: 'center' },
  pestImgSmall: { width: '100%', height: '90px', objectFit: 'cover' },
  detailFlex: { display: 'flex', gap: '25px', flexWrap: 'wrap' },
  detailImgLarge: { width: '250px', height: '250px', objectFit: 'cover', borderRadius: '15px', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  moaCard: { padding: '15px', border: '1px solid #fbc02d', borderRadius: '10px' },
  recordBtn: { marginTop: '10px', width: '100%', backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#ffebee', color: '#d32f2f', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  progressBg: { height: '10px', backgroundColor: '#eee', borderRadius: '10px', overflow: 'hidden', marginTop: '5px' },
  progressFill: { height: '100%', transition: '0.8s ease' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #eee' },
  td: { padding: '12px', fontSize: '14px' },
  tag: { backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  // ปฏิทิน
  calendarLayout: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center' },
  calHeader: { fontWeight: 'bold', padding: '5px', fontSize: '12px', color: '#777' },
  calDay: { padding: '15px 5px', borderRadius: '8px', fontSize: '14px', border: '1px solid #f0f0f0' },
  calDayEmpty: { padding: '10px' },
  apptDot: { width: '6px', height: '6px', backgroundColor: '#f44336', borderRadius: '50%', position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)' }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: "'Sarabun', sans-serif" }}>
      <header style={{ backgroundColor: '#1a237e', color: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>🛡️ IRAC DSS - ระบบจัดการสวนทุเรียน</h2>
        {currentUser && <button onClick={() => setCurrentUser(null)} style={{ backgroundColor: '#ff5252', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold' }}>Logout</button>}
      </header>
      <main>{!currentUser ? <AuthScreen onLogin={setCurrentUser} /> : <MainApp user={currentUser} />}</main>
    </div>
  );
}