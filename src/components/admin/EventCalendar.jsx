import { useState, useEffect, useCallback } from 'react';
import { loadItems, addItem, updateItem, deleteItem } from '../../services/cms';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOWS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CAT_COLORS = { festival: '#8B6914', royal: '#7A2E0E', traditional: '#1a2e5e', community: '#2D4A22', default: '#C9963A' };

function useCalendar(initialDate) {
  const [year, setYear] = useState(initialDate?.getFullYear() || new Date().getFullYear());
  const [month, setMonth] = useState(initialDate?.getMonth() || new Date().getMonth());
  const today = new Date();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = [];
  for (let i = startPad - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, other: true });
  for (let i = 1; i <= totalDays; i++) days.push({ day: i, other: false });
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push({ day: i, other: true });

  const isToday = (d) => !d.other && d.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const goPrev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else { setMonth(m => m - 1); } };
  const goNext = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else { setMonth(m => m + 1); } };
  const goToday = () => { setMonth(today.getMonth()); setYear(today.getFullYear()); };

  return { year, month, days, isToday, goPrev, goNext, goToday, setMonth, setYear };
}

export default function EventCalendar({ addToast, onListView }) {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editEv, setEditEv] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', time: '', venue: '', desc: '', cat: 'community', status: 'upcoming', organiser: '' });

  const cal = useCalendar();

  useEffect(() => { loadItems('events').then(setEvents); }, []);

  const refresh = useCallback(async () => {
    setEvents(await loadItems('events'));
    setShowForm(false);
    setEditEv(null);
  }, []);

  const getEventsForDay = (day, other) => {
    if (other) return [];
    const dateStr = `${cal.year}-${String(cal.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      if (!e.date) return false;
      const parts = e.date.split(/[/-]/);
      if (parts.length === 3) {
        const d = new Date(parts[2], parts[1] - 1, parts[0]);
        return d.getDate() === day && d.getMonth() === cal.month && d.getFullYear() === cal.year;
      }
      return e.date.includes(dateStr) || e.date.includes(`${day}/${cal.month + 1}/${cal.year}`);
    });
  };

  const handleDayClick = (day, other) => {
    if (other) return;
    const dateStr = `${String(day).padStart(2, '0')}/${String(cal.month + 1).padStart(2, '0')}/${cal.year}`;
    setSelectedDate(dateStr);
    setForm({ title: '', date: dateStr, time: '', venue: '', desc: '', cat: 'community', status: 'upcoming', organiser: '' });
    setEditEv(null);
    setShowForm(true);
  };

  const handleEditEvent = (ev) => {
    setEditEv(ev);
    setForm({ ...ev });
    setSelectedDate(ev.date);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { addToast('Title is required.', 'error'); return; }
    if (editEv) {
      const idx = events.indexOf(editEv);
      if (idx >= 0) await updateItem('events', idx, form);
    } else {
      await addItem('events', form);
    }
    addToast(`Event ${editEv ? 'updated' : 'created'}.`, 'success');
    refresh();
  };

  const handleDelete = async () => {
    if (!editEv || !confirm('Delete this event?')) return;
    const idx = events.indexOf(editEv);
    if (idx >= 0) await deleteItem('events', idx);
    addToast('Event deleted.', 'info');
    refresh();
  };

  return (
    <div>
      <div className="acal">
        <div className="acal-hd">
          <button className="abtn abtn-o" onClick={cal.goPrev} style={{ fontSize: '.55rem', padding: '.25rem .5rem' }}>←</button>
          <h3>{MONTHS[cal.month]} {cal.year}</h3>
          <div style={{ display: 'flex', gap: '.3rem' }}>
            <button className="abtn abtn-o" onClick={cal.goToday} style={{ fontSize: '.5rem', padding: '.25rem .5rem' }}>Today</button>
            <button className="abtn abtn-o" onClick={cal.goNext} style={{ fontSize: '.55rem', padding: '.25rem .5rem' }}>→</button>
          </div>
        </div>
        <div className="acal-grid">
          {DOWS.map(d => <div key={d} className="acal-dow">{d}</div>)}
          {cal.days.map((d, i) => {
            const dayEvents = getEventsForDay(d.day, d.other);
            return (
              <div key={i} className={`acal-day ${d.other ? 'acal-day-other' : ''} ${cal.isToday(d) ? 'acal-day-today' : ''}`}
                onClick={() => handleDayClick(d.day, d.other)}>
                <div className="acal-day-num">{d.day}</div>
                {dayEvents.slice(0, 3).map((ev, j) => (
                  <div key={j} className="acal-ev"
                    style={{ background: CAT_COLORS[ev.cat] || CAT_COLORS.default }}
                    onClick={e => { e.stopPropagation(); handleEditEvent(ev); }}
                    title={ev.title}>
                    {ev.title.substring(0, 18)}
                  </div>
                ))}
                {dayEvents.length > 3 && <div style={{ fontSize: '.5rem', color: 'rgba(245,237,216,.3)', paddingLeft: '.2rem' }}>+{dayEvents.length - 3} more</div>}
              </div>
            );
          })}
        </div>
        <div className="acal-legend">
          {Object.entries(CAT_COLORS).filter(([k]) => k !== 'default').map(([cat, color]) => (
            <div key={cat} className="acal-legend-item">
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
              {cat}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '.55rem', color: 'rgba(245,237,216,.3)' }}>{events.length} total events</span>
        </div>
      </div>

      {showForm && (
        <div className="amodal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="amodal" style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '.8rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                {editEv ? '✏️ Edit Event' : '➕ New Event'}
              </h3>
              <button onClick={() => setShowForm(false)} className="abtn abtn-d" style={{ padding: '.2rem .5rem' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: '.7rem' }}>
              {['title','date','time','venue','organiser'].map(field => (
                <div key={field}>
                  <label style={{ fontSize: '.55rem', color: 'rgba(201,150,58,.7)', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: '.2rem' }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input className="ainp" value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '.55rem', color: 'rgba(201,150,58,.7)', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: '.2rem' }}>Category</label>
                <select className="ainp" value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
                  {['festival','royal','traditional','community'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '.55rem', color: 'rgba(201,150,58,.7)', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: '.2rem' }}>Description</label>
                <textarea className="ainp" rows={3} value={form.desc || ''} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '.55rem', color: 'rgba(201,150,58,.7)', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: '.2rem' }}>Status</label>
                <select className="ainp" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              {editEv && <button className="abtn abtn-d" onClick={handleDelete}>🗑️ Delete</button>}
              <button className="abtn abtn-o" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="abtn abtn-p" onClick={handleSave}>{editEv ? '💾 Update' : '➕ Create'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        {onListView && <button className="abtn abtn-o" onClick={onListView}>📋 List View</button>}
      </div>
    </div>
  );
}
