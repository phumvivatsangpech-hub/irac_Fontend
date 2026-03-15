import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

const THAI_PROVINCES = ["กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"];

const GROWTH_STAGES = [
  { stage: "ระยะแตกใบอ่อน", tips: "เน้นฉีดพ่นเพลี้ยไก่แจ้และไรแดง ตรวจสอบโรคใบติด", color: "#4caf50" },
  { stage: "ระยะดอกตูม/ดอกบาน", tips: "ระวังเพลี้ยไฟกินเกสร และโรคดอกเน่า ไม่ควรพ่นยากลิ่นแรงช่วงดอกบาน", color: "#fbc02d" },
  { stage: "ระยะหางแย้/ผลอ่อน", tips: "ระวังหนอนเจาะผลและโรคราแป้ง ควบคุมน้ำให้สม่ำเสมอ", color: "#ff9800" },
  { stage: "ระยะผลโต/เก็บเกี่ยว", tips: "ตรวจหนอนเจาะเมล็ด และเว้นระยะปลอดภัย PHI ก่อนเก็บเกี่ยว", color: "#795548" }
];

// --- 1. Modern Weather System ---
function WeatherAlert({ user }) {
  const apiKey = "69ca605b89577740afd53f10cad86cf2";
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(localStorage.getItem(`loc_${user.id}`) || "");
  const [isEditing, setIsEditing] = useState(!selectedLoc);

  const fetchWeather = async (loc, isGPS = false) => {
    let baseUrl = `https://api.openweathermap.org/data/2.5/`;
    let query = isGPS ? `lat=${loc.lat}&lon=${loc.lon}` : `q=${loc},TH`;
    try {
      const resCurrent = await fetch(`${baseUrl}weather?${query}&appid=${apiKey}&units=metric&lang=th`);
      const dataCurrent = await resCurrent.json();
      const resForecast = await fetch(`${baseUrl}forecast?${query}&appid=${apiKey}&units=metric&lang=th`);
      const dataForecast = await resForecast.json();
      if (dataCurrent.cod === 200) {
        setWeather(dataCurrent);
        setSelectedLoc(isGPS ? `📍 ปัจจุบัน (${dataCurrent.name})` : loc);
        if (!isGPS) localStorage.setItem(`loc_${user.id}`, loc);
        setForecast(dataForecast.list.slice(0, 8).map(item => ({
          time: new Date(item.dt * 1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          temp: item.main.temp,
          rain: item.pop * 100
        })));
        setIsEditing(false);
      }
    } catch { alert("❌ ดึงข้อมูลอากาศล้มเหลว"); }
  };
  useEffect(() => { if (selectedLoc && !selectedLoc.includes("📍 ปัจจุบัน")) fetchWeather(selectedLoc); }, []);

  let sprayAdvice = { text: '🔄 วิเคราะห์...', color: '#666', bg: 'rgba(255,255,255,0.7)', icon: '⏳' };
  if (weather) {
    const isRain = weather.weather[0].main.includes("Rain") || weather.weather[0].description.includes("ฝน");
    if (isRain) sprayAdvice = { text: '🌧️ งดพ่นยา: ฝนตกหรือโอกาสตกสูง', color: '#e53935', bg: 'rgba(255,235,238,0.9)' };
    else if (weather.wind.speed * 3.6 > 15) sprayAdvice = { text: '💨 ระวัง: ลมแรงเกินไป สารจะฟุ้งกระจาย', color: '#fb8c00', bg: 'rgba(255,243,224,0.9)' };
    else sprayAdvice = { text: '🛡️ อากาศเหมาะสมสำหรับการพ่นยา', color: '#2e7d32', bg: 'rgba(232,245,233,0.9)' };
  }

  if (isEditing) return (
    <div style={styles.card}>
      <h4 style={{ marginTop: 0 }}>🌍 ตั้งค่าพื้นที่สวนของคุณ</h4>
      <div style={{ display: 'flex', gap: '10px' }}>
        <select style={styles.input} onChange={(e) => fetchWeather(e.target.value)}>
          <option value="">-- เลือกจังหวัด --</option>
          {THAI_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={() => navigator.geolocation.getCurrentPosition(p => fetchWeather({ lat: p.coords.latitude, lon: p.coords.longitude }, true))} style={{ ...styles.mainBtn, width: 'auto' }}>📍 GPS</button>
      </div>
    </div>
  );

  return (
    <div style={{ ...styles.weatherWidget, background: sprayAdvice.bg, borderLeft: `12px solid ${sprayAdvice.color}` }}>
      <div style={{ flex: 1, minWidth: '220px' }}>
        <h4 style={{ margin: 0, color: '#1a237e' }}>{selectedLoc}</h4>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>{weather?.weather[0].description} | {weather?.main.temp}°C | ลม {(weather?.wind.speed * 3.6).toFixed(1)} กม./ชม.</p>
        <b style={{ color: sprayAdvice.color, fontSize: '15px' }}>{sprayAdvice.text}</b>
        <br/><button onClick={() => setIsEditing(true)} style={styles.editText}>เปลี่ยนพื้นที่</button>
      </div>
      <div style={{ flex: 2, height: '120px', minWidth: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecast}>
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="temp" stroke="#1a237e" fillOpacity={0.3} fill="#1a237e" name="Temp" />
            <Area type="monotone" dataKey="rain" stroke="#0288d1" fillOpacity={0.3} fill="#b3e5fc" name="Rain%" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={styles.bestTimeBadge}>
        🕒 <b>Golden Hour</b><br/>06:00-09:00 | 16:00-18:00
      </div>
    </div>
  );
}

// --- 2. System Guide Component (ละเอียดยิบ) ---
function SystemGuide() {
  const guides = [
    { icon: "🛡️", t: "ระบบ IRAC/GAP", c: "ช่วยเลือกกลุ่มยาตามกลไกการออกฤทธิ์ เพื่อป้องกันการดื้อยาของแมลง และบันทึกข้อมูลตามมาตรฐานความปลอดภัย GAP" },
    { icon: "☁️", t: "พยากรณ์อากาศ", c: "วิเคราะห์อุณหภูมิ ลม และฝนแบบรายชั่วโมง เพื่อหาช่วงเวลาที่พ่นยาแล้วคุ้มค่าที่สุด สารเคมีไม่ถูกล้าง" },
    { icon: "📝", t: "การบันทึกข้อมูล", c: "คลิกรูปศัตรูพืช -> ดูคำแนะนำชีววิธี (IPM) -> กรอกอัตราการใช้ -> เลือกกลุ่มยา -> บันทึกพร้อมรูปภาพ" },
    { icon: "📅", t: "ปฏิทินอัจฉริยะ", c: "วางแผนนัดหมายล่วงหน้า วันที่ที่มีนัดหมายจะเป็นสีแดง ช่วยให้จัดการวงรอบการพ่นยาได้แม่นยำ" },
    { icon: "📊", t: "วิเคราะห์สถิติ", c: "ดูกราฟความถี่การใช้ยา หากแถบเป็นสีแดง (ใช้เกิน 3 ครั้ง) ควรเปลี่ยนกลุ่มยาทันที และส่งออกเป็น Excel ได้" }
  ];
  return (
    <div style={styles.card}>
      <h3 style={{ color: '#1a237e', marginTop: 0 }}>📖 คู่มือการใช้งานระบบอย่างละเอียด</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
        {guides.map((g, i) => (
          <div key={i} style={styles.guideItem}>
            <span style={{ fontSize: '24px' }}>{g.icon}</span>
            <div><b style={{ color: '#1a237e' }}>{g.t}</b><p style={{ fontSize: '13px', color: '#555', margin: '5px 0' }}>{g.c}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 3. Modern Calendar View ---
function CalendarView({ user, pests }) {
  const [currentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [newAppt, setNewAppt] = useState({ date: '', pest_id: '' });
  useEffect(() => { const saved = localStorage.getItem(`appt_${user.id}`); if (saved) setAppointments(JSON.parse(saved)); }, [user.id]);
  const handleAdd = (e) => {
    e.preventDefault();
    const updated = [...appointments, { ...newAppt, id: Date.now() }];
    setAppointments(updated); localStorage.setItem(`appt_${user.id}`, JSON.stringify(updated));
    setNewAppt({ date: '', pest_id: '' });
  };
  const renderDays = () => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const len = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    let res = [];
    for (let i = 0; i < start; i++) res.push(<div key={`e-${i}`} style={styles.calEmpty}></div>);
    for (let d = 1; d <= len; d++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const has = appointments.some(a => a.date === dateStr);
      res.push(<div key={d} style={{ ...styles.calDay, background: has ? '#ff5252' : '#fff', color: has ? '#fff' : '#333', fontWeight: has ? 'bold' : 'normal' }}>{d}</div>);
    }
    return res;
  };
  return (
    <div style={styles.calendarLayout}>
      <div style={styles.card}><h4 style={{ textAlign: 'center', color: '#1a237e' }}>📅 {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</h4><div style={styles.calendarGrid}>{['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => <b key={d} style={{ color: '#777', fontSize: '12px' }}>{d}</b>)}{renderDays()}</div></div>
      <div style={styles.card}><h4>📝 วางแผนการทำงาน</h4><form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><input type="date" style={styles.input} value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} required /><select style={styles.input} value={newAppt.pest_id} onChange={e => setNewAppt({...newAppt, pest_id: e.target.value})} required><option value="">-- เลือกศัตรูพืช --</option>{pests.map(p => <option key={p.pest_id} value={p.pest_id}>{p.pest_name}</option>)}</select><button style={{ ...styles.mainBtn, background: '#2e7d32' }}>เพิ่มนัดหมาย</button></form></div>
    </div>
  );
}

// --- 4. Main Application Layout ---
function MainApp({ user }) {
  const [view, setView] = useState('record');
  const [pests, setPests] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedPest, setSelectedPest] = useState(null);
  const [moaGroups, setMoaGroups] = useState([]);
  const [gapData, setGapData] = useState({ dosage: '', phi: '', image: null });

  const fetchH = () => { if (user?.id) fetch(`http://localhost:3000/api/history/${user.id}`).then(res => res.json()).then(data => setHistory(data)); };
  useEffect(() => { fetch('http://localhost:3000/api/pests').then(res => res.json()).then(data => setPests(data)); fetchH(); }, [user]);
  useEffect(() => { if (selectedPest) fetch(`http://localhost:3000/api/moa/${selectedPest}`).then(res => res.json()).then(data => setMoaGroups(data)); }, [selectedPest]);

  const handleSave = async (gId) => {
    const formData = new FormData();
    formData.append('user_id', user.id); formData.append('pest_id', selectedPest); formData.append('g_id', gId);
    formData.append('dosage', gapData.dosage); formData.append('phi_days', gapData.phi);
    if (gapData.image) formData.append('image', gapData.image);
    const res = await fetch('http://localhost:3000/api/history', { method: 'POST', body: formData });
    if (res.ok) { fetchH(); alert('บันทึกสำเร็จ'); setGapData({ dosage: '', phi: '', image: null }); }
  };

  const handleDelete = async (id) => { if (window.confirm('🗑️ ลบประวัตินี้?')) { await fetch(`http://localhost:3000/api/history/${id}`, { method: 'DELETE' }); fetchH(); } };

  const currentPest = pests.find(p => p.pest_id === selectedPest);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
      <header style={styles.mainHeader}>
        <div style={styles.profileInfo}><h2>สวัสดีคุณ {user.name} 🌳</h2><p style={{ margin: 0, opacity: 0.8 }}>ยินดีต้อนรับสู่แดชบอร์ดสวนทุเรียนของคุณ</p></div>
        <div style={styles.tabNav}>
          {['record', 'guide', 'calendar', 'stats', 'howTo'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ ...styles.navBtn, background: view === v ? '#fff' : 'transparent', color: view === v ? '#1a237e' : '#fff' }}>
              {v === 'record' ? '🚀 บันทึก' : v === 'guide' ? '📖 คู่มือพืช' : v === 'calendar' ? '📅 ปฏิทิน' : v === 'stats' ? '📊 สถิติ' : '💡 คู่มือระบบ'}
            </button>
          ))}
        </div>
      </header>

      <main style={{ marginTop: '30px' }}>
        {view === 'record' && (
          <>
            <WeatherAlert user={user} />
            <div style={styles.pestGrid}>{pests.map(p => (<div key={p.pest_id} onClick={() => setSelectedPest(p.pest_id)} style={{ ...styles.modernPestCard, border: selectedPest === p.pest_id ? '3px solid #1a237e' : 'none' }}><img src={p.image_url} style={styles.pestImg} alt="" /><p>{p.pest_name}</p></div>))}</div>
            {currentPest && (
              <div style={styles.modernDetailCard}>
                <img src={currentPest.image_url} style={styles.largeImg} alt="" />
                <div style={{ flex: 1 }}>
                  <h3>{currentPest.pest_name}</h3>
                  <div style={styles.ipmBox}>🌱 <b>ชีววิธี:</b> {currentPest.ipm_method}</div>
                  <div style={styles.gapGrid}>
                    <input placeholder="อัตราการใช้" style={styles.input} value={gapData.dosage} onChange={e => setGapData({...gapData, dosage: e.target.value})} />
                    <input type="number" placeholder="PHI (วัน)" style={styles.input} value={gapData.phi} onChange={e => setGapData({...gapData, phi: e.target.value})} />
                    <div style={{ gridColumn: 'span 2' }}>📷 <input type="file" onChange={e => setGapData({...gapData, image: e.target.files[0]})} style={{ fontSize: '12px' }} /></div>
                  </div>
                  <div style={styles.moaGrid}>{moaGroups.map(m => <button key={m.g_id} onClick={() => handleSave(m.g_id)} style={styles.moaBtn}>{m.g_name}</button>)}</div>
                </div>
              </div>
            )}
            <div style={styles.card}>
              <h4>📷 Visual Journal ประวัติการจัดการ</h4>
              <div style={styles.journalScroll}>{history.map(h => (<div key={h.log_id} style={styles.journalCard}><button onClick={() => handleDelete(h.log_id)} style={styles.deleteCircle}>×</button>{h.image_path ? <img src={`http://localhost:3000${h.image_path}`} style={styles.journalImg} /> : <div style={styles.noImg}>No Image</div>}<div style={{ padding: '8px' }}><b>{h.pest_name}</b><br/><small>{new Date(h.usage_date).toLocaleDateString('th-TH')}</small></div></div>))}</div>
            </div>
          </>
        )}
        {view === 'guide' && (<div style={styles.card}><h4>📖 คู่มือตามระยะการเติบโต</h4><div style={styles.stageGrid}>{GROWTH_STAGES.map((s, i) => (<div key={i} style={{ ...styles.stageCard, borderTop: `6px solid ${s.color}` }}><b style={{ color: s.color }}>{s.stage}</b><p>{s.tips}</p></div>))}</div></div>)}
        {view === 'calendar' && <CalendarView user={user} pests={pests} />}
        {view === 'stats' && <StatsView userId={user.id} history={history} user={user} />}
        {view === 'howTo' && <SystemGuide />}
      </main>
    </div>
  );
}

// --- 5. Statistics View ---
function StatsView({ userId, history, user }) {
  const [stats, setStats] = useState([]);
  useEffect(() => { if(userId) fetch(`http://localhost:3000/api/stats/${userId}`).then(res => res.json()).then(data => setStats(data)); }, [userId, history]);
  const handleExport = () => {
    const headers = ["วันที่", "อาการ", "กลุ่มยา", "PHI"];
    const rows = history.map(h => [new Date(h.usage_date).toLocaleDateString('th-TH'), h.pest_name, h.g_name, h.phi_days || "0"]);
    let csv = "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `GAP_Report_${user.name}.csv`; link.click();
  };
  return (
    <div style={styles.card}>
      <h3 style={{ color: '#1a237e' }}>📊 วิเคราะห์ข้อมูลการดื้อยา</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {stats.map((s, i) => (
          <div key={i} style={styles.statCard}>
            <b>{s.g_name}</b><h2>{s.count} <small>ครั้ง</small></h2>
            <div style={styles.progressBg}><div style={{ ...styles.progressFill, width: `${(s.count / 5) * 100}%`, background: s.count >= 3 ? '#ff5252' : '#4caf50' }}></div></div>
          </div>
        ))}
      </div>
      <center><button onClick={handleExport} style={styles.exportBtn}>📥 Download Full GAP Report (.CSV)</button></center>
    </div>
  );
}

// --- 6. Auth Screen (Clean UI) ---
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', name: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:3000/api/${isLogin ? 'login' : 'register'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.error) alert(data.error); else if (isLogin) onLogin(data.user); else { alert('สมัครสำเร็จ!'); setIsLogin(true); }
  };
  return (
    <div style={styles.authWrapper}>
      <div style={styles.authCard}>
        <div style={styles.logoCircle}>🛡️</div>
        <h2>IRAC Durian DSS</h2>
        <p style={{ opacity: 0.7 }}>ระบบจัดการสวนทุเรียนอัจฉริยะ</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {!isLogin && <input placeholder="ชื่อ-นามสกุล" style={styles.input} onChange={e => setForm({...form, name: e.target.value})} required />}
          <input placeholder="Username" style={styles.input} onChange={e => setForm({...form, username: e.target.value})} required />
          <input type="password" placeholder="Password" style={styles.input} onChange={e => setForm({...form, password: e.target.value})} required />
          <button style={styles.mainBtn}>{isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', fontSize: '13px', marginTop: '20px', color: '#1a237e' }}>{isLogin ? 'ยังไม่มีบัญชี? สมัครที่นี่' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}</p>
      </div>
    </div>
  );
}

// --- 7. Modern Styles Object ---
const styles = {
  mainHeader: { background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)', padding: '30px', borderRadius: '24px', color: '#fff', boxShadow: '0 10px 30px rgba(13,71,161,0.2)' },
  profileInfo: { marginBottom: '20px' },
  tabNav: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  navBtn: { padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: '0.3s' },
  card: { background: '#fff', padding: '25px', borderRadius: '24px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
  weatherWidget: { display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '25px', borderRadius: '24px', marginBottom: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', alignItems: 'center', position: 'relative' },
  bestTimeBadge: { position: 'absolute', top: '15px', right: '15px', background: '#fff', padding: '8px 15px', borderRadius: '12px', fontSize: '11px', border: '1px solid #eee' },
  pestGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '15px', marginBottom: '30px' },
  modernPestCard: { background: '#fff', padding: '10px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', transition: '0.3s', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' },
  pestImg: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '15px' },
  modernDetailCard: { display: 'flex', flexWrap: 'wrap', gap: '30px', background: 'rgba(255,255,255,0.8)', padding: '30px', borderRadius: '30px', border: '1px solid #fff', backdropFilter: 'blur(10px)', marginBottom: '30px' },
  largeImg: { width: '280px', height: '280px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
  gapGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' },
  input: { padding: '12px 15px', borderRadius: '12px', border: '1px solid #eee', background: '#f8f9fa', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  mainBtn: { padding: '14px', borderRadius: '12px', border: 'none', background: '#1a237e', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  moaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  moaBtn: { padding: '12px', borderRadius: '12px', border: 'none', background: '#2e7d32', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  journalScroll: { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' },
  journalCard: { minWidth: '150px', background: '#fff', borderRadius: '18px', border: '1px solid #eee', position: 'relative' },
  journalImg: { width: '100%', height: '100px', objectFit: 'cover', borderRadius: '18px 18px 0 0' },
  deleteCircle: { position: 'absolute', top: '5px', right: '5px', width: '22px', height: '22px', borderRadius: '50%', background: '#ff5252', color: '#fff', border: 'none', cursor: 'pointer', zIndex: 10 },
  statCard: { background: '#f8f9fa', padding: '20px', borderRadius: '20px' },
  progressBg: { height: '8px', background: '#eee', borderRadius: '10px', marginTop: '10px' },
  progressFill: { height: '100%', borderRadius: '10px', transition: '0.5s' },
  exportBtn: { padding: '15px 30px', borderRadius: '15px', border: 'none', background: '#0288d1', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  authWrapper: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
  authCard: { background: '#fff', padding: '50px', borderRadius: '40px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', width: '380px' },
  logoCircle: { width: '70px', height: '70px', borderRadius: '50%', background: '#1a237e', color: '#fff', fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' },
  calDay: { padding: '12px 5px', borderRadius: '12px', fontSize: '13px' },
  calEmpty: { padding: '12px' },
  guideItem: { display: 'flex', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '18px' },
  stageGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  stageCard: { background: '#f8f9fa', padding: '15px', borderRadius: '18px' },
  editText: { fontSize: '12px', color: '#1a237e', cursor: 'pointer', border: 'none', background: 'none', textDecoration: 'underline' }
};

export default function App() {
  const [user, setUser] = useState(null);
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Sarabun', sans-serif" }}>
      {user && (
        <nav style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
          <button onClick={() => setUser(null)} style={{ background: '#ff5252', color: '#fff', border: 'none', padding: '15px 25px', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(255,82,82,0.3)', cursor: 'pointer' }}>Logout 🚪</button>
        </nav>
      )}
      {!user ? <AuthScreen onLogin={setUser} /> : <MainApp user={user} />}
    </div>
  );
}