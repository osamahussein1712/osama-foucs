import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowDownLeft, ArrowLeft, CalendarDays, Check, CheckCheck, Circle, Clock3, Flame, LayoutDashboard, ListTodo, Moon, Plus, Quote, Search, Settings2, Sun, Target, Trash2, Trophy, X } from 'lucide-react';
import './styles.css';

const TASKS_KEY = 'focus-osama-tasks-v2';
const THEME_KEY = 'focus-osama-theme-v2';
const quotes = [
  { text: 'النجاح هو مجموع مجهودات صغيرة بتتكرر كل يوم.', author: 'روبرت كولير' },
  { text: 'مش لازم تكون عظيم عشان تبدأ، لكن لازم تبدأ عشان تبقى عظيم.', author: 'زيغ زيغلر' },
  { text: 'أحسن وقت تبدأ فيه كان امبارح، وتاني أحسن وقت هو دلوقتي.', author: 'مثل شائع' },
  { text: 'الانضباط هو إنك تختار اللي عايزه على المدى الطويل بدل اللي نفسك فيه دلوقتي.', author: 'مبدأ في تطوير الذات' },
  { text: 'رحلة الألف ميل بتبدأ بخطوة واحدة.', author: 'لاو تزو' },
  { text: 'متقيسش يومك بقد إيه عملت، قيسه بإنك اتحركت ناحية هدفك.', author: 'Focus' },
  { text: 'اللي بتعمله النهارده بيبني الشخص اللي هتبقى عليه بكرة.', author: 'Focus' },
  { text: 'الاستمرارية بتكسب الحماس لما الحماس يختفي.', author: 'مقولة تحفيزية' },
  { text: 'ركز على التقدم، مش الكمال.', author: 'مبدأ في تطوير الذات' },
  { text: 'كل إنجاز كبير كان في يوم من الأيام قرار صغير إنك تبدأ.', author: 'Focus' },
  { text: 'مش مطلوب منك تخلص كل حاجة النهارده؛ مطلوب تبدأ في الحاجة الصح.', author: 'Focus' },
  { text: 'الوقت هيمشي في كل الأحوال، فخلّيه يعدّي وإنت بتتقدم.', author: 'Focus' }
];
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const seedTasks = [
  {id:uid(), title:'مراجعة محاضرة Cost Accounting', category:'كلية', priority:'high', dueDate:todayKey(), originalDate:todayKey(), completed:false, createdAt:Date.now()},
  {id:uid(), title:'حل جزء من Database', category:'كلية', priority:'medium', dueDate:todayKey(), originalDate:todayKey(), completed:false, createdAt:Date.now()},
  {id:uid(), title:'مذاكرة C# لمدة 30 دقيقة', category:'تطوير', priority:'medium', dueDate:todayKey(), originalDate:todayKey(), completed:false, createdAt:Date.now()}
];
function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  const [filter, setFilter] = useState('today');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('كلية');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDate, setNewDate] = useState(todayKey());
  const [notice, setNotice] = useState('');
  const today = todayKey();
  const dateLabel = new Intl.DateTimeFormat('ar-EG', {weekday:'long', day:'numeric', month:'long', year:'numeric'}).format(new Date());
  const quoteIndex = Math.floor(new Date(`${today}T12:00:00`).getTime() / 86400000) % quotes.length;
  const quote = quotes[(quoteIndex + quotes.length) % quotes.length];

  useEffect(() => {
    // Any unfinished past-due task is carried into today once, without duplicating it.
    setTasks(current => {
      let changed = false;
      const next = current.map(task => {
        if (!task.completed && task.dueDate < today) {
          changed = true;
          return {...task, dueDate: today, carriedOver: true};
        }
        return task;
      });
      return changed ? next : current;
    });
  }, [today]);
  useEffect(() => { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(THEME_KEY, theme); document.documentElement.dataset.theme = theme; }, [theme]);

  const completedToday = tasks.filter(t => t.completed && t.completedDate === today).length;
  const dueTasks = tasks.filter(t => !t.completed && t.dueDate <= today);
  const todayAll = tasks.filter(t => t.dueDate === today);
  const doneCount = todayAll.filter(t => t.completed).length;
  const progress = todayAll.length ? Math.round(doneCount / todayAll.length * 100) : 0;
  const visibleTasks = useMemo(() => {
    let list = tasks.filter(t => {
      if (filter === 'today') return !t.completed && t.dueDate <= today;
      if (filter === 'upcoming') return !t.completed && t.dueDate > today;
      if (filter === 'completed') return t.completed;
      return !t.completed;
    });
    if (search.trim()) list = list.filter(t => `${t.title} ${t.category}`.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a,b) => {
      const p = {high:0, medium:1, low:2};
      return (a.dueDate || '').localeCompare(b.dueDate || '') || p[a.priority]-p[b.priority] || (a.createdAt || 0)-(b.createdAt || 0);
    });
  }, [tasks, filter, search, today]);

  function addTask(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const task = {id:uid(), title:newTitle.trim(), category:newCategory, priority:newPriority, dueDate:newDate || today, originalDate:newDate || today, completed:false, createdAt:Date.now()};
    setTasks(prev => [task, ...prev]);
    setNewTitle(''); setNewDate(today); setNewCategory('كلية'); setNewPriority('medium'); setShowAdd(false);
    setNotice('المهمة اتضافت بنجاح'); setTimeout(() => setNotice(''), 2200);
  }
  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? {...t, completed:!t.completed, completedDate:!t.completed ? today : null} : t));
  }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function resetDemo() {
    if (!window.confirm('هتمسح المهام الحالية وتضيف 3 مهام تجريبية. متأكد؟')) return;
    setTasks(seedTasks); setNotice('تمت إضافة مهام تجريبية'); setTimeout(() => setNotice(''), 2200);
  }
  const filterNames = {today:'مهام اليوم', upcoming:'المهام الجاية', completed:'اللي خلصته', all:'كل المهام'};
  return <div className="app-shell" dir="rtl">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Target size={23}/></div><div><strong>Focus</strong><span>مساحة أسامة</span></div></div>
      <div className="side-label">مساحة العمل</div>
      <nav className="nav">
        <button className={filter==='today'?'active':''} onClick={()=>setFilter('today')}><LayoutDashboard size={18}/> <span>نظرة عامة</span><ArrowLeft size={15} className="nav-arrow"/></button>
        <button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}><ListTodo size={18}/> <span>كل المهام</span></button>
        <button className={filter==='upcoming'?'active':''} onClick={()=>setFilter('upcoming')}><CalendarDays size={18}/> <span>المهام الجاية</span><span className="nav-count">{tasks.filter(t=>!t.completed&&t.dueDate>today).length}</span></button>
        <button className={filter==='completed'?'active':''} onClick={()=>setFilter('completed')}><CheckCheck size={18}/> <span>الإنجازات</span></button>
      </nav>
      <div className="sidebar-bottom">
        <div className="focus-tip"><div className="tip-icon"><Flame size={18}/></div><b>افتكر هدفك</b><p>مش لازم تخلص كل حاجة مرة واحدة. المهم تفضل بتتحرك.</p></div>
        <button className="theme-toggle" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}<span>{theme==='dark'?'الوضع النهاري':'الوضع الليلي'}</span><span className="toggle-dot"/></button>
        <div className="profile"><div className="avatar">أ</div><div><b>أسامة</b><span>مساحة إنتاجيتك</span></div><Settings2 size={17} className="profile-settings"/></div>
      </div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div><div className="eyebrow"><span className="status-dot"></span> مساحتك الشخصية</div><h1>خلّي يومك له معنى يا أسامة <span>✦</span></h1><p className="date-text">{dateLabel}</p></div><div className="top-actions"><button className="icon-btn mobile-theme" aria-label="تغيير المظهر" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button><button className="primary-btn" onClick={()=>setShowAdd(true)}><Plus size={18}/> مهمة جديدة</button></div></header>

      <section className="quote-card"><div className="quote-symbol"><Quote size={22}/></div><div className="quote-content"><div className="quote-heading">حكمة النهارده <span className="live-pill">جديدة كل يوم</span></div><blockquote>«{quote.text}»</blockquote><div className="quote-author">— {quote.author}</div></div><div className="quote-spark">✳</div></section>

      <section className="stats-grid">
        <div className="stat-card"><div className="stat-top"><span>المهام المستحقة</span><div className="stat-icon green"><ListTodo size={19}/></div></div><div className="stat-number">{dueTasks.length}<small> مهمة</small></div><div className="stat-foot"><span className="tiny-dot green-dot"></span> محتاجة تركيزك النهارده</div></div>
        <div className="stat-card"><div className="stat-top"><span>إنجاز النهارده</span><div className="stat-icon blue"><CheckCheck size={19}/></div></div><div className="stat-number">{completedToday}<small> مهمة</small></div><div className="stat-foot">كمّل، كل خطوة بتفرق</div></div>
        <div className="stat-card progress-card"><div className="stat-top"><span>نسبة إنجاز مهام اليوم</span><div className="stat-icon purple"><Activity size={19}/></div></div><div className="progress-row"><div className="stat-number">{progress}<small>%</small></div><div className="progress-ring" style={{'--progress':`${progress*3.6}deg`}}><span>{progress}%</span></div></div><div className="progress-track"><span style={{width:`${progress}%`}}/></div></div>
      </section>

      <section className="task-section">
        <div className="section-header"><div><div className="section-title-row"><h2>{filterNames[filter]}</h2><span className="task-total">{visibleTasks.length}</span></div><p>{filter==='today'?'ابدأ بالأهم، وسيب الباقي ياخد دوره.':filter==='completed'?'كل مهمة خلصتها دليل إنك بتتقدم.':'رتّب أولوياتك وخليك سابق بخطوة.'}</p></div><div className="task-controls"><label className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="دوّر على مهمة..."/></label><button className="add-small" onClick={()=>setShowAdd(true)}><Plus size={17}/></button></div></div>
        <div className="task-list">
          {visibleTasks.map(task=><article className={`task-row ${task.completed?'is-complete':''}`} key={task.id}>
            <button className={`check-task ${task.completed?'checked':''}`} onClick={()=>toggleTask(task.id)} aria-label={task.completed?'إلغاء إكمال المهمة':'إكمال المهمة'}>{task.completed&&<Check size={15}/>}</button>
            <div className="task-main"><div className="task-title">{task.title}</div><div className="task-meta"><span className={`category-tag ${task.category==='كلية'?'college':task.category==='تطوير'?'dev':'personal'}`}>{task.category}</span>{task.carriedOver&&<span className="carry-tag"><ArrowDownLeft size={12}/> مترحّلة</span>}{task.dueDate>today&&<span className="due-date"><CalendarDays size={12}/>{task.dueDate}</span>}</div></div>
            <span className={`priority priority-${task.priority}`}><i/>{task.priority==='high'?'مهمة جدًا':task.priority==='medium'?'متوسطة':'بسيطة'}</span>
            <button className="delete-btn" onClick={()=>deleteTask(task.id)} aria-label="حذف المهمة"><Trash2 size={16}/></button>
          </article>)}
          {visibleTasks.length===0&&<div className="empty-state"><div className="empty-icon">{filter==='completed'?<Trophy size={25}/>:<CheckCheck size={25}/>}</div><h3>{filter==='completed'?'لسه مفيش إنجازات مسجلة':'مفيش مهام هنا دلوقتي'}</h3><p>{filter==='today'?'استمتع بالهدوء، أو ضيف مهمة جديدة وابدأ.':'ضيف مهمة جديدة لما تكون جاهز.'}</p>{filter!=='completed'&&<button className="primary-btn" onClick={()=>setShowAdd(true)}><Plus size={17}/> ضيف أول مهمة</button>}</div>}
        </div>
        {filter==='today'&&dueTasks.some(t=>t.carriedOver)&&<div className="carry-note"><ArrowDownLeft size={16}/><span>المهام اللي فات موعدها بتترحل تلقائيًا لليوم الحالي، من غير ما تتكرر.</span></div>}
      </section>
      <footer className="footer"><span>FOCUS <span className="footer-dot">•</span> خطوة صغيرة كل يوم</span><span>بياناتك محفوظة على جهازك <span className="privacy-dot"></span></span></footer>
    </main>

    {showAdd&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}><form className="task-modal" onSubmit={addTask}><div className="modal-head"><div><span className="modal-kicker">خلّيها خطوة واضحة</span><h2>ضيف مهمة جديدة</h2></div><button type="button" className="close-btn" onClick={()=>setShowAdd(false)}><X size={19}/></button></div><label className="field-label">اسم المهمة<input autoFocus value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="مثال: مذاكرة محاضرة Finance" required maxLength={140}/></label><div className="form-grid"><label className="field-label">التصنيف<select value={newCategory} onChange={e=>setNewCategory(e.target.value)}><option>كلية</option><option>تطوير</option><option>شخصي</option><option>شغل</option></select></label><label className="field-label">الأولوية<select value={newPriority} onChange={e=>setNewPriority(e.target.value)}><option value="high">مهمة جدًا</option><option value="medium">متوسطة</option><option value="low">بسيطة</option></select></label></div><label className="field-label">موعد المهمة<input type="date" value={newDate} min={today} onChange={e=>setNewDate(e.target.value)} required/></label><div className="modal-hint"><Clock3 size={15}/> لو المهمة ما خلصتش في يومها، هتترحل تلقائيًا لليوم التالي عند فتح الموقع.</div><div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setShowAdd(false)}>إلغاء</button><button className="primary-btn" type="submit"><Plus size={17}/> إضافة المهمة</button></div></form></div>}
    {notice&&<div className="toast"><Check size={17}/>{notice}</div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
