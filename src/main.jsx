import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const seedTasks = () => [
  { id: crypto.randomUUID(), time: '12:00', title: 'أصحى وأستعد لصلاة الجمعة', category: 'روتين', note: 'فطار خفيف وتجهيز للنزول', done: false, color: 'mint' },
  { id: crypto.randomUUID(), time: '12:40', title: 'صلاة الجمعة', category: 'صلاة', note: 'الموعد تقريبي — راعي وقت الخطبة والمسافة', done: false, color: 'sky' },
  { id: crypto.randomUUID(), time: '13:30', title: 'Database — محاضرة واحدة', category: 'جامعة', note: 'ساعتين فهم وتلخيص وحل أمثلة', done: false, color: 'purple' },
  { id: crypto.randomUUID(), time: '15:30', title: 'راحة + صلاة العصر', category: 'صلاة', note: 'العصر حوالي 3:51 م — راجع الأذان المحلي', done: false, color: 'sky' },
  { id: crypto.randomUUID(), time: '16:00', title: 'Cost Accounting — محاضرة واحدة', category: 'جامعة', note: 'ركّز على الفهم والمسائل، مش المشاهدة بس', done: false, color: 'orange' },
  { id: crypto.randomUUID(), time: '18:00', title: 'صلاة المغرب + أكل خفيف', category: 'صلاة', note: 'المغرب حوالي 6:16 م — راجع التوقيت المحلي', done: false, color: 'sky' },
  { id: crypto.randomUUID(), time: '18:30', title: 'تحضير مقابلة Enactus', category: 'تطوير', note: 'عرّف نفسك، ليه Video & Motion، وموقف يثبت التزامك', done: false, color: 'pink' },
  { id: crypto.randomUUID(), time: '19:30', title: 'الكورة + صلاة العشاء', category: 'حياة', note: 'أكد معاد الحجز، وصلّي العشاء في وقته', done: false, color: 'mint' },
];
const categoryOptions = ['جامعة','تطوير','صلاة','صحة','شغل','روتين','حياة','أخرى'];
const categoryColors = { 'جامعة':'purple','تطوير':'pink','صلاة':'sky','صحة':'mint','شغل':'orange','روتين':'mint','حياة':'orange','أخرى':'purple' };
const readStore = () => { try { return JSON.parse(localStorage.getItem('osama-focus-v1') || '{}'); } catch { return {}; } };
const saveStore = (v) => localStorage.setItem('osama-focus-v1', JSON.stringify(v));
const prettyDate = (key) => new Date(`${key}T12:00:00`).toLocaleDateString('ar-EG', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

function App() {
  const [store, setStore] = useState(() => {
    const s = readStore(); const k = todayKey();
    if (!s[k]) { s[k] = seedTasks(); saveStore(s); }
    return s;
  });
  const [date, setDate] = useState(todayKey());
  const [filter, setFilter] = useState('الكل');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title:'', time:'', category:'جامعة', note:'' });
  const [toast, setToast] = useState('');
  const tasks = store[date] || [];
  const completed = tasks.filter(t => t.done).length;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const filtered = useMemo(() => tasks.filter(t => filter === 'الكل' || (filter === 'خلصت' ? t.done : !t.done)), [tasks, filter]);
  const patchTasks = (next) => setStore(prev => { const s = {...prev, [date]: next}; saveStore(s); return s; });
  const flash = (msg) => { setToast(msg); window.setTimeout(() => setToast(''), 2200); };
  const toggle = (id) => { patchTasks(tasks.map(t => t.id === id ? {...t, done: !t.done} : t)); };
  const remove = (id) => { patchTasks(tasks.filter(t => t.id !== id)); flash('المهمة اتمسحت'); };
  const openAdd = () => { setEditing(null); setForm({title:'',time:'',category:'جامعة',note:''}); setShowAdd(true); };
  const openEdit = (t) => { setEditing(t.id); setForm({title:t.title,time:t.time,category:t.category,note:t.note || ''}); setShowAdd(true); };
  const submit = (e) => {
    e.preventDefault(); if (!form.title.trim()) return;
    if (editing) patchTasks(tasks.map(t => t.id === editing ? {...t, ...form, title:form.title.trim(), color:categoryColors[form.category] || 'purple'} : t));
    else patchTasks([...tasks, {id:crypto.randomUUID(), ...form, title:form.title.trim(), done:false, color:categoryColors[form.category] || 'purple'}].sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99')));
    setShowAdd(false); flash(editing ? 'المهمة اتعدّلت' : 'المهمة اتضافت');
  };
  const resetDay = () => { if (window.confirm('ترجع مهام اليوم للشكل الأساسي؟ ده هيمسح التعديلات الحالية لليوم ده.')) { patchTasks(seedTasks()); flash('رجّعنا خطة اليوم'); } };
  const shiftDate = (amount) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+amount); const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; setDate(k); setFilter('الكل'); };

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Focus home"><span className="brand-mark">✦</span><span>focus<span className="brand-dot">.</span></span></a>
      <div className="topbar-right"><span className="save-status"><i></i> حفظ تلقائي</span><div className="avatar">أ</div></div>
    </header>
    <main id="top" className="main-content">
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="sparkle">✦</span> مساحتك — خطوتك الجاية</div><h1>يلا يا أسامة،<br/><span>ننجز حاجة حقيقية.</span></h1><p>مش مطلوب يوم مثالي. مطلوب تبدأ، وتكمّل اللي عليك خطوة بخطوة.</p>
          <div className="hero-actions"><button className="primary-btn" onClick={openAdd}>＋ أضف مهمة</button><button className="ghost-btn" onClick={() => document.getElementById('tasks-section')?.scrollIntoView({behavior:'smooth'})}>شوف مهامي <span>↓</span></button></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="art-star star-a">✦</div><div className="art-star star-b">✧</div><div className="art-card"><div className="mini-check">✓</div><div><b>خطوة صغيرة</b><small>أحسن من التأجيل</small></div><span className="art-arrow">↗</span></div><div className="art-center"><span>✦</span></div><div className="art-pill">ONE THING AT A TIME</div></div>
      </section>

      <section className="date-row"><div><div className="section-kicker">خطة يومك</div><h2>{prettyDate(date)}</h2><p>اختار اليوم اللي عايز تتابع مهامه.</p></div><div className="date-controls"><button onClick={() => shiftDate(-1)} aria-label="اليوم السابق">‹</button><input type="date" value={date} onChange={e=>setDate(e.target.value)} aria-label="اختار التاريخ"/><button onClick={() => shiftDate(1)} aria-label="اليوم التالي">›</button><button className="today-btn" onClick={() => setDate(todayKey())}>النهارده</button></div></section>

      <section className="stats-grid">
        <div className="stat-card progress-card"><div className="stat-top"><span className="stat-icon purple-icon">◉</span><span className="stat-label">إنجاز اليوم</span></div><div className="progress-number">{percent}<small>%</small></div><div className="progress-track"><div className="progress-fill" style={{width:`${percent}%`}}/></div><div className="stat-foot"><span>{completed} من {tasks.length} مهام</span><span>{percent===100 && tasks.length ? 'عاش يا بطل! 🎉' : 'كمّل واحدة كمان'}</span></div></div>
        <div className="stat-card"><div className="stat-top"><span className="stat-icon mint-icon">✓</span><span className="stat-label">خلصت</span></div><div className="stat-value">{completed}<small> مهمة</small></div><div className="stat-note">كل علامة صح بتفرق.</div><div className="stat-decoration mint-deco">✓</div></div>
        <div className="stat-card"><div className="stat-top"><span className="stat-icon orange-icon">◷</span><span className="stat-label">لسه عليك</span></div><div className="stat-value">{tasks.length-completed}<small> مهمة</small></div><div className="stat-note">ابدأ بالأهم، مش بالأسهل.</div><div className="stat-decoration orange-deco">✦</div></div>
      </section>

      <section id="tasks-section" className="tasks-layout">
        <div className="tasks-main"><div className="section-heading"><div><div className="section-kicker">خطوة بخطوة</div><h2>قائمة المهام <span className="count-badge">{tasks.length}</span></h2></div><button className="add-small" onClick={openAdd}>＋ مهمة جديدة</button></div>
          <div className="filter-row">{['الكل','لسه عليا','خلصت'].map(f=><button key={f} onClick={()=>setFilter(f)} className={filter===f?'filter-active':''}>{f}</button>)}</div>
          <div className="task-list">{filtered.length ? filtered.map((t, i)=><article className={`task-item ${t.done?'task-done':''}`} key={t.id}><button className={`check-button ${t.done?'checked':''}`} onClick={()=>toggle(t.id)} aria-label={t.done?'إلغاء الإنجاز':'تحديد كمكتملة'}>{t.done?'✓':''}</button><div className="task-time">{t.time || 'بدون وقت'}</div><div className="task-colorbar" data-color={t.color || 'purple'}></div><div className="task-info"><div className="task-title-line"><h3>{t.title}</h3><span className={`category-tag tag-${t.color || 'purple'}`}>{t.category}</span></div>{t.note && <p>{t.note}</p>}</div><div className="task-actions"><button onClick={()=>openEdit(t)} aria-label="تعديل المهمة" title="تعديل">✎</button><button onClick={()=>remove(t.id)} aria-label="حذف المهمة" title="حذف">×</button></div></article>) : <div className="empty-state"><span>✧</span><h3>مفيش مهام هنا دلوقتي</h3><p>دي فرصتك تضيف حاجة مهمة أو تستمتع بإنجازك.</p><button className="primary-btn" onClick={openAdd}>＋ أضف مهمة</button></div>}</div>
          <div className="list-footer"><span>✦</span> مش لازم تخلص كل حاجة مرة واحدة — المهم متقفش.</div>
        </div>
        <aside className="side-column"><div className="focus-card"><div className="focus-orb">✦</div><div className="focus-label">تذكير ليك</div><h3>الالتزام مش إنك تبقى متحمس كل يوم.</h3><p>الالتزام إنك تعمل الخطوة اللي عليك حتى لو مش في المود.</p><div className="focus-signature">خطوة واحدة دلوقتي تكفي.</div></div>
          <div className="quick-card"><div className="quick-heading"><span className="quick-icon">☀</span><div><h3>قواعد اليوم</h3><p>خلّيها بسيطة</p></div></div><ul><li><span className="rule-dot purple-dot"></span> الموبايل لهدف محدد، مش ريلز.</li><li><span className="rule-dot sky-dot"></span> الصلاة في وقتها حسب أذان منطقتك.</li><li><span className="rule-dot mint-dot"></span> محاضرتين بفهم أحسن من خمس بسرعة.</li><li><span className="rule-dot orange-dot"></span> جهّز للانترفيو بصوتك، مش حفظ.</li></ul><button className="reset-btn" onClick={resetDay}>↻ رجّع خطة اليوم الأساسية</button></div>
        </aside>
      </section>
      <footer className="footer"><span className="footer-brand">focus<span>.</span></span><span>مصمّم لأسامة — على مهلك، بس كمّل.</span><span className="footer-spark">✦</span></footer>
    </main>
    {showAdd && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}><form className="task-modal" onSubmit={submit}><button type="button" className="modal-close" onClick={()=>setShowAdd(false)}>×</button><div className="section-kicker">رتّب أولوياتك</div><h2>{editing?'عدّل المهمة':'مهمة جديدة'}</h2><label>اسم المهمة<input autoFocus required maxLength="90" placeholder="مثلاً: أراجع محاضرة Finance" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><div className="form-grid"><label>الوقت<input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label><label>التصنيف<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categoryOptions.map(c=><option key={c}>{c}</option>)}</select></label></div><label>ملاحظات صغيرة<textarea rows="3" placeholder="إيه اللي محتاج تفتكره؟" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label><div className="modal-actions"><button type="button" className="ghost-btn" onClick={()=>setShowAdd(false)}>إلغاء</button><button type="submit" className="primary-btn">{editing?'حفظ التعديلات':'إضافة المهمة'}</button></div></form></div>}
    {toast && <div className="toast">✓ {toast}</div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
