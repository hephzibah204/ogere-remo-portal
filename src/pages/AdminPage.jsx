import { useState, useEffect, useCallback, useRef } from 'react';
import { dbGet, dbSet, dbDelete } from '../services/storage';
import { loadItems, saveItems, addItem, updateItem, deleteItem, deleteMultiple, moveItem, getStats, getContentTypes, isSubmissionType, importDefaults, searchAll, getMedia, addMedia, deleteMedia, getAuditLog, addAuditLog, clearAuditLog, authenticateUser, getUsers, addUser, updateUser, deleteUser } from '../services/cms';
import { kings } from '../data/kings';
import { photos } from '../data/gallery';
import { STATIC_NEWS } from '../data/news';
import { STATIC_EVENTS } from '../data/events';
import { notable, diasporaGroups } from '../data/diaspora';
import { MAP_LOCATIONS } from '../data/mapLocations';
import WysiwygEditor from '../components/admin/WysiwygEditor';
import EventCalendar from '../components/admin/EventCalendar';
import PuckEditor from '../components/admin/PuckEditor';

const ADMIN_PW = import.meta.env.VITE_ADMIN_PASSWORD || 'ogere2026';
import { exportToCSV } from '../services/db';

const PAGE_SIZE = 20;

const SIDEBAR_SECTIONS = [
  { label: 'Dashboard', icon: '📊', id: 'dashboard' },
  { label: 'Community Operations', icon: '🏛️', id: 'operations', children: [
    { id: 'idCards', label: 'ID Cards Queue', icon: '🪪' },
    { id: 'royalAudiences', label: 'Royal Audiences', icon: '👑' },
    { id: 'landRegistry', label: 'Land Registry & Disputes', icon: '📜' },
    { id: 'scholarships', label: 'Scholarships Review', icon: '🎓' },
    { id: 'bloodDonors', label: 'Blood Donors', icon: '🩸' },
    { id: 'marketplaceAdmin', label: 'Marketplace Listings', icon: '🛒' },
    { id: 'incidentReports', label: 'Incident Reports', icon: '🚨' },
    { id: 'pageantRegistrations', label: 'Miss Olipakala Contestants', icon: '👑' },
  ]},
  { label: 'Site Content', icon: '📝', id: 'content', children: [
    { id: 'kings', label: 'Kings', icon: '👑' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
    { id: 'news', label: 'News', icon: '📰' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'eventCalendar', label: 'Calendar View', icon: '🗓️' },
    { id: 'blog', label: 'Blog Posts', icon: '📝' },
    { id: 'diasporaNotable', label: 'Notable Diaspora', icon: '🌟' },
    { id: 'diasporaGroups', label: 'Diaspora Groups', icon: '🤝' },
    { id: 'mapLocations', label: 'Map Locations', icon: '🗺️' },
  ]},
  { label: 'Submissions', icon: '📋', id: 'submissions', children: [
    { id: 'biz', label: 'Business Listings', icon: '🏪' },
    { id: 'suggestions', label: 'Suggestions', icon: '💡' },
    { id: 'msgs', label: 'Contact Messages', icon: '✉️' },
    { id: 'forum', label: 'Forum Posts', icon: '💬' },
    { id: 'assoc', label: 'Association Regs', icon: '📋' },
  ]},
  { label: 'Media Library', icon: '🖼️', id: 'media' },
  { label: 'Settings', icon: '⚙️', id: 'settings' },
];

function Toast({ toast, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  const colors = { success: 'rgba(45,74,34,.9)', error: 'rgba(181,69,27,.9)', info: 'rgba(26,46,94,.9)', warning: 'rgba(139,105,20,.9)' };
  return (
    <div style={{
      padding: '.6rem 1rem .6rem .8rem', borderRadius: 4, marginBottom: '.4rem',
      background: colors[toast.type] || colors.info,
      borderLeft: `3px solid ${toast.type === 'success' ? '#4ade80' : toast.type === 'error' ? '#f87171' : toast.type === 'warning' ? '#fbbf24' : '#60a5fa'}`,
      color: '#F5EDD8', fontSize: '.78rem', display: 'flex', alignItems: 'center', gap: '.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,.4)', animation: 'slideIn .25s ease',
      maxWidth: 400,
    }}>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: '.7rem', padding: 0 }}>✕</button>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  const container = toasts.length > 0 ? (
    <div style={{ position: 'fixed', top: 56, right: 16, zIndex: 200000, display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
      {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />)}
    </div>
  ) : null;
  return { addToast: add, toastContainer: container };
}

function RichTextarea({ value, onChange, placeholder, rows }) {
  const [showToolbar, setShowToolbar] = useState(false);
  const textRef = useRef(null);

  const wrap = (before, after) => {
    const ta = textRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const next = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + selected.length); }, 0);
  };

  return (
    <div>
      {showToolbar && (
        <div style={{ display: 'flex', gap: '.15rem', marginBottom: '.25rem', flexWrap: 'wrap' }}>
          <button type="button" className="art-btn" onClick={() => wrap('<b>', '</b>')} title="Bold"><b>B</b></button>
          <button type="button" className="art-btn" onClick={() => wrap('<i>', '</i>')} title="Italic"><i>I</i></button>
          <button type="button" className="art-btn" onClick={() => wrap('<u>', '</u>')} title="Underline"><u>U</u></button>
          <button type="button" className="art-btn" onClick={() => wrap('<strong>', '</strong>')} title="Strong">S</button>
          <span style={{ color: 'rgba(201,150,58,.2)', padding: '0 .15rem' }}>|</span>
          <button type="button" className="art-btn" onClick={() => wrap('\n• ', '')} title="Bullet List">• List</button>
          <button type="button" className="art-btn" onClick={() => wrap('\n1. ', '')} title="Numbered List">1. List</button>
          <button type="button" className="art-btn" onClick={() => wrap('[', '](url)')} title="Link">🔗</button>
          <span style={{ color: 'rgba(201,150,58,.2)', padding: '0 .15rem' }}>|</span>
          <button type="button" className="art-btn" onClick={() => wrap('<blockquote>', '</blockquote>')} title="Blockquote">❝</button>
          <button type="button" className="art-btn" onClick={() => wrap('<h3>', '</h3>')} title="Heading">H3</button>
          <button type="button" className="art-btn" onClick={() => wrap('<hr />', '')} title="Divider">—</button>
        </div>
      )}
      <textarea ref={textRef} className="ainp" rows={rows || 4} value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setShowToolbar(true)}
        onBlur={() => setTimeout(() => setShowToolbar(false), 200)}
        style={{ minHeight: rows * 20 || 80 }}
      />
    </div>
  );
}

function FieldInput({ field, value, onChange, onOpenMedia }) {
  const id = `f-${field.k}`;
  if (field.t === 'richtext') {
    return <WysiwygEditor value={value || ''} onChange={v => onChange(field.k, v)} placeholder={field.l} onOpenMedia={onOpenMedia} minHeight={300} />;
  }
  if (field.t === 'textarea') {
    return <RichTextarea value={value || ''} onChange={v => onChange(field.k, v)} placeholder={field.l} rows={field.k === 'body' || field.k === 'message' || field.k === 'oriki' ? 6 : 3} />;
  }
  if (field.t === 'bool') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer', color: '#F5EDD8', fontSize: '.85rem' }}>
        <input type="checkbox" checked={!!value} onChange={e => onChange(field.k, e.target.checked)} style={{ width: 18, height: 18, accentColor: '#C9963A' }} />
        {field.l}
      </label>
    );
  }
  if (field.t === 'select') {
    return (
      <select id={id} className="ainp" value={value || ''} onChange={e => onChange(field.k, e.target.value)}>
        <option value="">— Select —</option>
        {(field.o || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (field.t === 'color') {
    return (
      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
        <input type="color" value={value || '#C9963A'} onChange={e => onChange(field.k, e.target.value)} style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', background: 'none' }} />
        <input type="text" className="ainp" value={value || ''} onChange={e => onChange(field.k, e.target.value)} placeholder="#hex" style={{ flex: 1 }} />
      </div>
    );
  }
  if (field.t === 'url') {
    return (
      <div style={{ display: 'flex', gap: '.3rem' }}>
        <input type="url" className="ainp" value={value || ''} onChange={e => onChange(field.k, e.target.value)} placeholder="https://..." style={{ flex: 1 }} />
        {onOpenMedia && <button type="button" className="abtn abtn-o" onClick={onOpenMedia} style={{ padding: '.4rem .5rem', fontSize: '.6rem' }} title="Media Library">📁</button>}
        {value && <button type="button" className="abtn abtn-o" onClick={() => window.open(value, '_blank')} style={{ padding: '.4rem .5rem', fontSize: '.6rem' }} title="Preview">👁️</button>}
      </div>
    );
  }
  if (field.t === 'number') {
    return <input type="number" step="any" className="ainp" value={value ?? ''} onChange={e => onChange(field.k, parseFloat(e.target.value) || 0)} />;
  }
  if (field.t === 'emoji') {
    return (
      <div style={{ display: 'flex', gap: '.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.5rem', minWidth: 30, textAlign: 'center' }}>{value || '📝'}</span>
        <input className="ainp" value={value || ''} onChange={e => onChange(field.k, e.target.value)} placeholder="Paste emoji..." style={{ flex: 1 }} />
        {['👑','🏛️','🎉','🎊','💰','🚦','⛽','🛣️','🌍','🌟','⚽','🏪','📰','📅','🗺️','🏨','🏫','⛪','🚔','🛖','🚛'].map(e => (
          <button key={e} type="button" className="art-btn" onClick={() => onChange(field.k, e)} style={{ fontSize: '1rem', padding: '.1rem .25rem' }}>{e}</button>
        ))}
      </div>
    );
  }
  if (field.t === 'list') {
    const arr = Array.isArray(value) ? value : [];
    const [input, setInput] = useState('');
    return (
      <div>
        <div style={{ display: 'flex', gap: '.3rem', marginBottom: '.4rem' }}>
          <input className="ainp" value={input} onChange={e => setInput(e.target.value)} placeholder="Add item..." style={{ flex: 1 }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (input.trim()) { onChange(field.k, [...arr, input.trim()]); setInput(''); } }}}
          />
          <button className="abtn abtn-s" onClick={() => { if (input.trim()) { onChange(field.k, [...arr, input.trim()]); setInput(''); } }} type="button">+</button>
        </div>
        {arr.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '.3rem', alignItems: 'center', marginBottom: '.15rem', padding: '.2rem .4rem', background: 'rgba(201,150,58,.06)', borderRadius: 3 }}>
            <span style={{ flex: 1, fontSize: '.78rem', color: '#F5EDD8' }}>{item}</span>
            <button className="abtn abtn-d" onClick={() => onChange(field.k, arr.filter((_, j) => j !== i))} type="button" style={{ padding: '.1rem .3rem', fontSize: '.55rem' }}>✕</button>
          </div>
        ))}
      </div>
    );
  }
  return <input type="text" className="ainp" value={value || ''} onChange={e => onChange(field.k, e.target.value)} />;
}

function ContentForm({ type, def, item, index, onSave, onClose, addToast, onOpenMedia, onOpenPuck }) {
  const [form, setForm] = useState(item ? { ...item } : {});
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    const mediaHandler = (e) => { handleChange(e.detail.key, e.detail.url); };
    window.addEventListener('cms-media-select', mediaHandler);
    return () => { window.removeEventListener('keydown', handler); window.removeEventListener('cms-media-select', mediaHandler); };
  });

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    const required = def.fields.filter(f => f.r);
    for (const f of required) {
      if (!form[f.k] || String(form[f.k]).trim() === '') {
        addToast(`"${f.l}" is required.`, 'error');
        return;
      }
    }
    setSaving(true);
    const action = index >= 0 ? 'updated' : 'added';
    if (index >= 0) {
      await updateItem(type, index, form);
    } else {
      if (!form.id) form.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
      await addItem(type, form);
    }
    await addAuditLog({ action: `${action} ${def.label}`, type, details: form.name || form.title || form.topic || form.n || form.headline || '' });
    setSaving(false);
    addToast(`${def.label} ${action} successfully.`, 'success');
    onSave();
  };

  return (
    <div className="amodal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="amodal" ref={formRef} style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '.85rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              {index >= 0 ? '✏️ Edit' : '➕ Add'} {def.label}
            </h3>
            <p style={{ fontSize: '.65rem', color: 'rgba(245,237,216,.35)', marginTop: '.15rem' }}>Press Ctrl+S to save · Esc to close</p>
          </div>
          <div style={{ display: 'flex', gap: '.3rem' }}>
            {type === 'pages' && index >= 0 && (
              <button onClick={() => onOpenPuck(form)} className="abtn abtn-p" style={{ fontSize: '.55rem', padding: '.3rem .5rem' }}>✨ Visual Editor</button>
            )}
            {index >= 0 && <button onClick={() => setShowPreview(!showPreview)} className="abtn abtn-o" style={{ fontSize: '.55rem', padding: '.3rem .5rem' }}>{showPreview ? '✏️ Edit' : '👁️ Preview'}</button>}
            <button onClick={onClose} className="abtn abtn-d" style={{ padding: '.3rem .5rem' }}>✕</button>
          </div>
        </div>

        {showPreview && item ? (
          <div style={{ padding: '1rem', background: 'rgba(201,150,58,.03)', border: '1px solid rgba(201,150,58,.12)', borderRadius: 4, maxHeight: '60vh', overflow: 'auto' }}>
            <div style={{ fontSize: '.7rem', color: '#C9963A', fontFamily: "'Cinzel',serif", letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.5rem' }}>Preview</div>
            <div style={{ fontSize: '1.2rem', color: '#F5EDD8', fontFamily: "'Playfair Display',serif", marginBottom: '.3rem', fontWeight: 700 }}>
              {form.name || form.title || form.topic || form.n || form.headline || form.t || 'Untitled'}
            </div>
            {form.date && <div style={{ fontSize: '.7rem', color: 'rgba(201,150,58,.6)', marginBottom: '.5rem' }}>📅 {form.date}</div>}
            {form.cat && <span className="atag atag-gold" style={{ marginBottom: '.5rem' }}>{form.cat}</span>}
            {form.desc && <div style={{ fontSize: '.85rem', lineHeight: 1.7, color: 'rgba(245,237,216,.68)', marginTop: '.5rem' }}>{form.desc}</div>}
            {form.body && <div style={{ fontSize: '.85rem', lineHeight: 1.7, color: 'rgba(245,237,216,.68)', marginTop: '.5rem' }}>{form.body}</div>}
            {form.note && <div style={{ fontSize: '.85rem', lineHeight: 1.7, color: 'rgba(245,237,216,.68)', marginTop: '.5rem' }}>{form.note}</div>}
            {form.message && <div style={{ fontSize: '.85rem', lineHeight: 1.7, color: 'rgba(245,237,216,.68)', marginTop: '.5rem' }}>{form.message}</div>}
            {form.oriki && <div style={{ fontSize: '.85rem', lineHeight: 1.7, color: 'rgba(201,150,58,.7)', fontStyle: 'italic', marginTop: '.5rem' }}>{form.oriki}</div>}
            {form.src && <div style={{ marginTop: '.5rem' }}><img src={form.src} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }} /></div>}
            {form.venue && <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.45)', marginTop: '.3rem' }}>📍 {form.venue}</div>}
            {form.address && <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.45)', marginTop: '.3rem' }}>📍 {form.address}</div>}
            {form.phone && <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.45)', marginTop: '.3rem' }}>📞 {form.phone}</div>}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '.8rem' }}>
            {def.fields.map(field => (
              <div key={field.k}>
                {field.t !== 'bool' && (
                  <label htmlFor={`f-${field.k}`} style={{ display: 'block', fontSize: '.6rem', color: 'rgba(201,150,58,.8)', fontFamily: "'Cinzel',serif", letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '.25rem' }}>
                    {field.l} {field.r && <span style={{ color: '#B5451B' }}>*</span>}
                  </label>
                )}
                <FieldInput field={field} value={form[field.k]} onChange={handleChange} onOpenMedia={(field.t === 'url' || field.t === 'richtext') ? () => onOpenMedia && onOpenMedia(field.k) : undefined} />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
          <button onClick={onClose} className="abtn abtn-o">Cancel</button>
          {showPreview && <button onClick={() => setShowPreview(false)} className="abtn abtn-o">✏️ Back to Edit</button>}
          <button onClick={handleSave} className="abtn abtn-p" disabled={saving}>{saving ? '⏳ Saving...' : index >= 0 ? '💾 Update' : '➕ Create'}</button>
        </div>
      </div>
    </div>
  );
}

function ContentListView({ type, def, items, onRefresh, onEdit, onAdd, addToast, isSubmission }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkField, setBulkField] = useState('');
  const [bulkValue, setBulkValue] = useState('');
  const [page, setPage] = useState(0);

  const filtered = items.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return Object.values(item).some(v => String(v || '').toLowerCase().includes(q));
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [search]);

  const toggleSelect = (fi) => {
    const next = new Set(selected);
    next.has(fi) ? next.delete(fi) : next.add(fi);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === paged.length) { setSelected(new Set()); }
    else { setSelected(new Set(paged.map((_, i) => i))); }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} item(s)?`)) return;
    const indices = [...selected].map(si => items.indexOf(paged[si]));
    await deleteMultiple(type, indices);
    setSelected(new Set()); setBulkMode(false);
    await addAuditLog({ action: `bulk deleted ${selected.size} ${def.label}`, type });
    addToast(`Deleted ${selected.size} item(s).`, 'success');
    onRefresh();
  };

  const handleBulkEdit = async () => {
    if (!bulkField || selected.size === 0) return;
    if (!confirm(`Set "${bulkField}" to "${bulkValue}" for ${selected.size} item(s)?`)) return;
    const updated = [...items];
    [...selected].forEach(si => {
      const idx = items.indexOf(paged[si]);
      if (idx >= 0) updated[idx] = { ...updated[idx], [bulkField]: bulkValue };
    });
    await saveItems(type, updated);
    setSelected(new Set()); setBulkField(''); setBulkValue(''); setBulkMode(false);
    addToast(`Edited ${selected.size} item(s).`, 'success');
    onRefresh();
  };

  const handleCopy = async (idx) => {
    const copy = { ...items[idx], id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4) };
    await addItem(type, copy);
    addToast(`${def.label} duplicated.`, 'success');
    onRefresh();
  };

  const handleDelete = async (idx) => {
    if (!confirm('Delete this item?')) return;
    await deleteItem(type, idx);
    await addAuditLog({ action: `deleted ${def.label}`, type, details: items[idx]?.name || '' });
    addToast('Deleted.', 'info');
    onRefresh();
  };

  const handleMove = async (idx, dir) => {
    const to = idx + dir;
    if (to < 0 || to >= items.length) return;
    await moveItem(type, idx, to);
    onRefresh();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '.8rem' }}>
        <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.7rem', opacity: .35 }}>🔍</span>
          <input className="ainp" style={{ paddingLeft: '1.6rem', fontSize: '.75rem' }} placeholder={`Search ${def.label}...`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="abtn abtn-p" onClick={onAdd}>+ Add</button>
        <button className={`abtn ${bulkMode ? 'abtn-p' : 'abtn-o'}`} onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}>
          {bulkMode ? 'Exit Bulk' : 'Bulk'}
        </button>
      </div>

      {bulkMode && selected.size > 0 && (
        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '.8rem', padding: '.6rem', background: 'rgba(201,150,58,.06)', borderRadius: 4, border: '1px solid rgba(201,150,58,.12)' }}>
          <span style={{ fontSize: '.7rem', color: '#C9963A', fontFamily: "'Cinzel',serif" }}>Bulk: {selected.size} selected</span>
          <select className="ainp" style={{ width: 'auto', minWidth: 120, fontSize: '.65rem', padding: '.3rem .5rem' }} value={bulkField} onChange={e => setBulkField(e.target.value)}>
            <option value="">— Field —</option>
            {def.fields.filter(f => f.t !== 'bool' && f.t !== 'list').map(f => (
              <option key={f.k} value={f.k}>{f.l}</option>
            ))}
          </select>
          {bulkField && (
            <input className="ainp" style={{ width: 'auto', minWidth: 120, fontSize: '.65rem', padding: '.3rem .5rem' }} value={bulkValue} onChange={e => setBulkValue(e.target.value)} placeholder="Value..." />
          )}
          <button className="abtn abtn-p" onClick={handleBulkEdit} disabled={!bulkField} style={{ fontSize: '.5rem', padding: '.3rem .5rem' }}>Apply</button>
          <button className="abtn abtn-d" onClick={handleBulkDelete} style={{ fontSize: '.5rem', padding: '.3rem .5rem' }}>Delete</button>
        </div>
      )}

      <div style={{ fontSize: '.68rem', color: 'rgba(245,237,216,.35)', marginBottom: '.4rem', display: 'flex', justifyContent: 'space-between' }}>
        <span>{filtered.length} item(s) {search ? `(filtered from ${items.length})` : ''}</span>
        {totalPages > 1 && <span>Page {page + 1} of {totalPages}</span>}
      </div>

      <div className="alist">
        <div className="alist-header">
          {bulkMode && (
            <div style={{ width: 28 }}>
              <input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} style={{ accentColor: '#C9963A' }} />
            </div>
          )}
          {def.list.map(col => (
            <div key={col} style={{ flex: 1, fontFamily: "'Cinzel',serif", fontSize: '.5rem', letterSpacing: '.08em', color: '#C9963A', textTransform: 'uppercase' }}>
              {def.fields.find(f => f.k === col)?.l || col}
            </div>
          ))}
          <div style={{ width: 130, textAlign: 'right', fontFamily: "'Cinzel',serif", fontSize: '.5rem', letterSpacing: '.08em', color: '#C9963A', textTransform: 'uppercase' }}>Actions</div>
        </div>

        {paged.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(245,237,216,.25)' }}>
            {search ? 'No items match your search.' : 'No items yet.'}
          </div>
        ) : (
          paged.map((item, fi) => {
            const realIdx = items.indexOf(item);
            return (
              <div key={realIdx} className="alist-row" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.45rem .5rem', borderBottom: '1px solid rgba(201,150,58,.06)' }}>
                {bulkMode && (
                  <div style={{ width: 28 }}>
                    <input type="checkbox" checked={selected.has(fi)} onChange={() => toggleSelect(fi)} style={{ accentColor: '#C9963A' }} />
                  </div>
                )}
                {def.list.map(col => (
                  <div key={col} style={{ flex: 1, fontSize: '.72rem', color: '#F5EDD8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {col === 'cur' ? (item[col] ? '👑 Yes' : '—')
                    : col === 'status' ? <span className={`atag ${item[col] === 'approved' ? 'atag-green' : item[col] === 'pending' ? 'atag-gold' : ''}`}>{item[col] || '—'}</span>
                    : col === 'cat' ? <span style={{ color: 'rgba(201,150,58,.7)' }}>{item[col]}</span>
                    : col === 'date' ? <span style={{ color: 'rgba(245,237,216,.4)', fontSize: '.65rem' }}>{item[col] || '—'}</span>
                    : String(item[col] || '—').substring(0, 50)}
                  </div>
                ))}
                <div style={{ width: 130, display: 'flex', gap: '.15rem', justifyContent: 'flex-end' }}>
                  <button className="abtn abtn-o" onClick={() => onEdit(realIdx)} style={{ padding: '.15rem .35rem', fontSize: '.5rem' }} title="Edit">✏️</button>
                  <button className="abtn abtn-o" onClick={() => handleCopy(realIdx)} style={{ padding: '.15rem .35rem', fontSize: '.5rem' }} title="Duplicate">📋</button>
                  {!isSubmission && (
                    <>
                      <button className="abtn abtn-o" onClick={() => handleMove(realIdx, -1)} disabled={realIdx === 0} style={{ padding: '.15rem .35rem', fontSize: '.5rem' }} title="Up">↑</button>
                      <button className="abtn abtn-o" onClick={() => handleMove(realIdx, 1)} disabled={realIdx === items.length - 1} style={{ padding: '.15rem .35rem', fontSize: '.5rem' }} title="Down">↓</button>
                    </>
                  )}
                  <button className="abtn abtn-d" onClick={() => handleDelete(realIdx)} style={{ padding: '.15rem .35rem', fontSize: '.5rem' }} title="Delete">🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '.3rem', marginTop: '1rem' }}>
          <button className="abtn abtn-o" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} style={{ padding: '.3rem .6rem', fontSize: '.55rem' }}>← Prev</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum;
            if (totalPages <= 7) pageNum = i;
            else if (page < 4) pageNum = i;
            else if (page > totalPages - 5) pageNum = totalPages - 7 + i;
            else pageNum = page - 3 + i;
            return (
              <button key={pageNum} className={`abtn ${pageNum === page ? 'abtn-p' : 'abtn-o'}`} onClick={() => setPage(pageNum)} style={{ padding: '.3rem .55rem', fontSize: '.55rem', minWidth: 28 }}>
                {pageNum + 1}
              </button>
            );
          })}
          <button className="abtn abtn-o" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} style={{ padding: '.3rem .6rem', fontSize: '.55rem' }}>Next →</button>
        </div>
      )}
    </div>
  );
}

function SubmissionListView({ type, def, items, onRefresh, addToast }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = items.filter(item => {
    if (filter === 'pending') {
      if (item.status === 'approved' || item.approved === true) return false;
    }
    if (filter === 'approved') {
      if (item.status !== 'approved' && item.approved !== true) return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return Object.values(item).some(v => String(v || '').toLowerCase().includes(q));
  });

  const handleApprove = async (idx) => {
    const item = { ...items[idx], status: 'approved', approved: true };
    await updateItem(type, idx, item);
    await addAuditLog({ action: `approved ${type}`, details: item.name || item.topic || item.title || '' });
    addToast('Approved.', 'success');
    onRefresh();
  };

  const handleDelete = async (idx) => {
    if (!confirm('Delete this item?')) return;
    await deleteItem(type, idx);
    addToast('Deleted.', 'info');
    onRefresh();
  };

  const pending = items.filter(i => i.status === 'pending' || i.approved === false).length;
  const approved = items.filter(i => i.status === 'approved' || i.approved === true).length;

  return (
    <div>
      <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '.8rem' }}>
        <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.7rem', opacity: .35 }}>🔍</span>
          <input className="ainp" style={{ paddingLeft: '1.6rem', fontSize: '.75rem' }} placeholder={`Search ${def.label}...`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '.3rem', alignItems: 'center' }}>
          {[{ id: 'all', label: `All (${items.length})` }, { id: 'pending', label: `⏳ Pending (${pending})` }, { id: 'approved', label: `✓ Approved (${approved})` }].map(f => (
            <button key={f.id} className={`abtn ${filter === f.id ? 'abtn-p' : 'abtn-o'}`} onClick={() => setFilter(f.id)} style={{ fontSize: '.5rem', padding: '.3rem .5rem' }}>{f.label}</button>
          ))}
          <button
            className="abtn abtn-o"
            onClick={() => {
              if (!items.length) {
                addToast('No items to export', 'warning');
                return;
              }
              exportToCSV(`ogere_${type}_export`, items);
              addToast(`Exported ${items.length} records to CSV`, 'success');
            }}
            style={{ fontSize: '.5rem', padding: '.3rem .5rem', background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.4)', color: '#86efac' }}
            title="Download CSV spreadsheet"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className="asub-list">
        {filtered.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(245,237,216,.25)' }}>No items found.</div>
        ) : (
          filtered.map((item, fi) => {
            const realIdx = items.indexOf(item);
            const isPending = item.status === 'pending' || item.approved === false;
            const isApproved = item.status === 'approved' || item.approved === true;
            return (
              <div key={realIdx} className="asub-card" style={{
                padding: '.8rem 1rem', borderRadius: 4, marginBottom: '.4rem',
                background: `rgba(${isApproved ? '45,74,34' : isPending ? '201,150,58' : '201,150,58'},.04)`,
                border: `1px solid rgba(${isApproved ? '45,74,34' : isPending ? '201,150,58' : '201,150,58'},.12)`,
                borderLeft: `3px solid ${isApproved ? '#2D4A22' : isPending ? '#C9963A' : '#8B6914'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.3rem', marginBottom: '.3rem' }}>
                  <div style={{ fontWeight: 'bold', color: '#F5EDD8', fontSize: '.8rem' }}>
                    {item.name || item.topic || item.title || `#${realIdx + 1}`}
                  </div>
                  <div style={{ display: 'flex', gap: '.3rem', alignItems: 'center' }}>
                    <span className={`atag ${isApproved ? 'atag-green' : isPending ? 'atag-gold' : ''}`}>
                      {isApproved ? 'Approved' : isPending ? 'Pending' : item.status || '—'}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '.68rem', color: 'rgba(245,237,216,.45)', marginBottom: '.2rem' }}>
                  {item.email && <span>✉️ {item.email} </span>}
                  {item.phone && <span>📞 {item.phone} </span>}
                  {item.date && <span>📅 {item.date}</span>}
                  {item.category && <span>🏷️ {item.category}</span>}
                  {item.venue && <span>📍 {item.venue}</span>}
                </div>
                {item.subject && <div style={{ fontSize: '.6rem', color: 'rgba(201,150,58,.55)', fontFamily: "'Cinzel',serif", letterSpacing: '.05em', marginBottom: '.2rem' }}>{item.subject}</div>}
                {(item.desc || item.message || item.body) && (
                  <div style={{ fontSize: '.74rem', color: 'rgba(245,237,216,.55)', lineHeight: 1.5, marginBottom: '.2rem' }}>
                    {(item.desc || item.message || item.body).substring(0, 250)}
                    {(item.desc || item.message || item.body || '').length > 250 ? '...' : ''}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '.3rem', marginTop: '.4rem', flexWrap: 'wrap' }}>
                  {isPending && <button className="abtn abtn-p" onClick={() => handleApprove(realIdx)} style={{ fontSize: '.5rem', padding: '.25rem .6rem' }}>✓ Approve</button>}
                  <button className="abtn abtn-d" onClick={() => handleDelete(realIdx)} style={{ fontSize: '.5rem', padding: '.25rem .6rem' }}>🗑️ Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MediaLibrary({ onClose, addToast, onSelect, standalone }) {
  const [media, setMedia] = useState([]);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => { getMedia().then(setMedia); }, []);

  const handleAdd = async () => {
    if (!url.trim()) return;
    await addMedia({ url: url.trim(), label: label.trim() || 'Untitled', cat: 'general' });
    setUrl(''); setLabel('');
    addToast('Image added to library.', 'success');
    setMedia(await getMedia());
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove from library?')) return;
    await deleteMedia(id);
    setMedia(await getMedia());
    addToast('Removed.', 'info');
  };

  const content = (
    <><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '.8rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>🖼️ Media Library</h3>
          {!standalone && <button onClick={onClose} className="abtn abtn-d" style={{ padding: '.2rem .5rem' }}>✕</button>}
        </div>

        <div style={{ display: 'flex', gap: '.3rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input className="ainp" style={{ flex: 2, fontSize: '.72rem' }} placeholder="Image URL..." value={url} onChange={e => setUrl(e.target.value)} />
          <input className="ainp" style={{ flex: 1, fontSize: '.72rem' }} placeholder="Label..." value={label} onChange={e => setLabel(e.target.value)} />
          <button className="abtn abtn-p" onClick={handleAdd}>Add</button>
        </div>

        {media.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(245,237,216,.25)' }}>No images in library. Add one above.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '.4rem' }}>
            {media.map(m => (
              <div key={m.id} style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.1)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: 80, background: `url(${m.url}) center/cover`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onError={e => { e.target.style.background = 'rgba(201,150,58,.1)'; e.target.innerHTML = '❌'; }}>
                </div>
                <div style={{ padding: '.3rem' }}>
                  <div style={{ fontSize: '.58rem', color: 'rgba(245,237,216,.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</div>
                  <div style={{ display: 'flex', gap: '.15rem', marginTop: '.2rem' }}>
                    <button className="abtn abtn-o" onClick={() => { if (onSelect) onSelect(m.url); onClose(); }} style={{ padding: '.1rem .3rem', fontSize: '.45rem', flex: 1 }}>Use</button>
                    <button className="abtn abtn-d" onClick={() => handleDelete(m.id)} style={{ padding: '.1rem .3rem', fontSize: '.45rem' }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  return standalone ? <div style={{ padding: '1rem', background: 'rgba(201,150,58,.03)', border: '1px solid rgba(201,150,58,.1)', borderRadius: 6 }}>{content}</div> : (
    <div className="amodal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="amodal" style={{ maxWidth: 700 }}>{content}</div>
    </div>
  );
}

function GlobalSearch({ onClose, onNavigate, addToast }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const r = await searchAll(query);
      setResults(r);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (r) => {
    onNavigate(r.type);
    onClose();
  };

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = { label: r.typeLabel, icon: r.typeIcon, items: [] };
    acc[r.type].items.push(r);
    return acc;
  }, {});

  return (
    <div className="amodal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="amodal" style={{ maxWidth: 600, padding: '1rem' }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <span style={{ position: 'absolute', left: '.6rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.9rem', opacity: .5 }}>🔍</span>
          <input className="ainp" style={{ paddingLeft: '2rem', fontSize: '.9rem', padding: '.6rem .7rem .6rem 2rem' }}
            placeholder="Search all content..." value={query} onChange={e => setQuery(e.target.value)} autoFocus
            onKeyDown={e => e.key === 'Escape' && onClose()}
          />
        </div>

        {searching && <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(245,237,216,.3)' }}>Searching...</div>}

        {!searching && query.trim().length >= 2 && Object.keys(grouped).length === 0 && (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(245,237,216,.25)' }}>No results for "{query}".</div>
        )}

        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          {Object.entries(grouped).map(([type, group]) => (
            <div key={type} style={{ marginBottom: '.8rem' }}>
              <div style={{ fontSize: '.55rem', color: '#C9963A', fontFamily: "'Cinzel',serif", letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem' }}>
                {group.icon} {group.label} ({group.items.length})
              </div>
              {group.items.map(r => (
                <div key={`${r.type}-${r.index}`} onClick={() => handleSelect(r)}
                  style={{ padding: '.35rem .5rem', cursor: 'pointer', borderRadius: 3, fontSize: '.78rem', color: '#F5EDD8', display: 'flex', justifyContent: 'space-between', gap: '.5rem' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,150,58,.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
                  <span style={{ color: 'rgba(245,237,216,.3)', fontSize: '.65rem', flexShrink: 0 }}>#{r.index + 1}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardHome({ stats, onNavigate, addToast }) {
  const totalContent = Object.entries(stats).filter(([k]) => !isSubmissionType(k)).reduce((s, [, v]) => s + v.count, 0);
  const totalSubmissions = Object.entries(stats).filter(([k]) => isSubmissionType(k)).reduce((s, [, v]) => s + v.count, 0);
  const maxCount = Math.max(1, ...Object.values(stats).map(s => s.count));

  const chartTypes = Object.entries(stats).filter(([k]) => !isSubmissionType(k)).slice(0, 7);

  return (
    <div>
      <h2 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', marginBottom: '.2rem' }}>📊 Dashboard</h2>
      <p style={{ color: 'rgba(245,237,216,.4)', fontSize: '.75rem', marginBottom: '1.2rem' }}>Welcome to the Ogere Remo CMS — manage all site content from one place.</p>

      <div className="astats">
        <div className="astat-card"><div className="astat-num">{totalContent}</div><div className="astat-label">📄 Content Items</div></div>
        <div className="astat-card"><div className="astat-num">{totalSubmissions}</div><div className="astat-label">📋 Submissions</div></div>
        <div className="astat-card"><div className="astat-num">{stats.biz?.count || 0}</div><div className="astat-label">🏪 Businesses</div></div>
        <div className="astat-card"><div className="astat-num">{stats.suggestions?.count || 0}</div><div className="astat-label">💡 Suggestions</div></div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1rem' }}>
        <div style={{ background: 'rgba(201,150,58,0.03)', border: '1px solid rgba(201,150,58,0.1)', borderRadius: 6, padding: '1rem' }}>
          <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>⚡ Quick Create</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <button 
              onClick={() => { onNavigate('news'); setTimeout(() => window.dispatchEvent(new CustomEvent('cms-quick-add')), 50); }}
              className="abtn abtn-p" 
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.65rem', padding: '0.6rem' }}
            >
              📰 Add News Article
            </button>
            <button 
              onClick={() => { onNavigate('blog'); setTimeout(() => window.dispatchEvent(new CustomEvent('cms-quick-add')), 50); }}
              className="abtn abtn-o" 
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.65rem', padding: '0.6rem' }}
            >
              📝 Add Blog Post
            </button>
          </div>
        </div>

        <div style={{ background: 'rgba(201,150,58,0.03)', border: '1px solid rgba(201,150,58,0.1)', borderRadius: 6, padding: '1rem' }}>
          <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>📈 Distribution</h3>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            {chartTypes.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 20, textAlign: 'center', fontSize: '.7rem' }}>{v.icon}</span>
                <div style={{ flex: 1, height: 18, background: 'rgba(201, 150, 58, 0.06)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${(v.count / maxCount) * 100}%`, background: 'var(--gold)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: '.65rem', color: 'rgba(245,237,216,0.5)', minWidth: 24, textAlign: 'right' }}>{v.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(201,150,58,0.03)', border: '1px solid rgba(201,150,58,0.1)', borderRadius: 6, padding: '1rem' }}>
          <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>🔔 Pending Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {Object.entries(stats).filter(([k]) => isSubmissionType(k)).map(([k, v]) => (
              <button key={k} className="abtn abtn-o" onClick={() => onNavigate(k)} style={{ justifyContent: 'space-between', fontSize: '.55rem', padding: '.4rem .6rem' }}>
                <span>{v.icon} {v.label}</span>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{v.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '.5rem' }}>
        <div style={{ padding: '.7rem', background: 'rgba(201,150,58,.03)', border: '1px solid rgba(201,150,58,.08)', borderRadius: 4 }}>
          <div style={{ fontSize: '.55rem', color: 'rgba(201,150,58,.5)', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', letterSpacing: '.08em' }}>Storage</div>
          <div style={{ fontSize: '.78rem', color: '#F5EDD8', marginTop: '.15rem' }}>localStorage (ogere-*)</div>
        </div>
        <div style={{ padding: '.7rem', background: 'rgba(201,150,58,.03)', border: '1px solid rgba(201,150,58,.08)', borderRadius: 4 }}>
          <div style={{ fontSize: '.55rem', color: 'rgba(201,150,58,.5)', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', letterSpacing: '.08em' }}>Admin Password</div>
          <div style={{ fontSize: '.78rem', color: '#F5EDD8', marginTop: '.15rem' }}>
            {ADMIN_PW === 'ogere2026' ? <span style={{ color: '#d97706' }}>⚠ Default</span> : '✓ Custom'}
          </div>
        </div>
        <div style={{ padding: '.7rem', background: 'rgba(201,150,58,.03)', border: '1px solid rgba(201,150,58,.08)', borderRadius: 4 }}>
          <div style={{ fontSize: '.55rem', color: 'rgba(201,150,58,.5)', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', letterSpacing: '.08em' }}>Anthropic API</div>
          <div style={{ fontSize: '.78rem', color: '#F5EDD8', marginTop: '.15rem' }}>
            {import.meta.env.VITE_ANTHROPIC_API_KEY ? '✓ Configured' : <span style={{ color: '#666' }}>— Not set</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditLogPanel() {
  const [log, setLog] = useState([]);

  useEffect(() => { getAuditLog().then(setLog); }, []);

  const handleClear = async () => {
    if (!confirm('Clear audit log?')) return;
    await clearAuditLog();
    setLog([]);
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
        <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>📋 Activity Log ({log.length})</h3>
        <button className="abtn abtn-d" onClick={handleClear} style={{ fontSize: '.5rem', padding: '.2rem .5rem' }}>Clear Log</button>
      </div>
      <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid rgba(201,150,58,.08)', borderRadius: 4 }}>
        {log.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(245,237,216,.2)', fontSize: '.7rem' }}>No activity yet.</div>
        ) : (
          log.map(entry => (
            <div key={entry.id} style={{ padding: '.3rem .5rem', borderBottom: '1px solid rgba(201,150,58,.04)', fontSize: '.68rem', color: 'rgba(245,237,216,.55)', display: 'flex', gap: '.5rem' }}>
              <span style={{ color: 'rgba(201,150,58,.5)', fontSize: '.6rem', flexShrink: 0 }}>
                {new Date(entry.ts).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span style={{ color: '#C9963A', flexShrink: 0 }}>{entry.action}</span>
              {entry.details && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.details}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function UserManager({ addToast }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'editor' });

  useEffect(() => { getUsers().then(setUsers); }, []);

  const handleAdd = async () => {
    if (!form.username || !form.password) { addToast('Username and password required.', 'error'); return; }
    const done = await addUser(form);
    if (!done) { addToast('Username already exists.', 'error'); return; }
    addToast(`Editor "${form.username}" created.`, 'success');
    setShowForm(false);
    setForm({ username: '', password: '', name: '', role: 'editor' });
    setUsers(await getUsers());
  };

  const handleDelete = async (id, username) => {
    if (id === 'admin') { addToast('Cannot delete the default admin.', 'error'); return; }
    if (!confirm(`Delete user "${username}"?`)) return;
    await deleteUser(id);
    setUsers(await getUsers());
    addToast(`User "${username}" deleted.`, 'info');
  };

  return (
    <div className="asection">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.8rem' }}>
        <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>👥 User Management</h3>
        <button className="abtn abtn-p" onClick={() => setShowForm(!showForm)} style={{ fontSize: '.5rem', padding: '.25rem .5rem' }}>
          {showForm ? '✕ Cancel' : '+ Add Editor'}
        </button>
      </div>

      {showForm && (
        <div style={{ display: 'grid', gap: '.4rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', marginBottom: '.8rem', padding: '.8rem', background: 'rgba(201,150,58,.04)', borderRadius: 4, border: '1px solid rgba(201,150,58,.1)' }}>
          <input className="ainp" placeholder="Username*" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={{ fontSize: '.68rem' }} />
          <input className="ainp" type="password" placeholder="Password*" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ fontSize: '.68rem' }} />
          <input className="ainp" placeholder="Display Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ fontSize: '.68rem' }} />
          <select className="ainp" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ fontSize: '.68rem' }}>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <button className="abtn abtn-p" onClick={handleAdd} style={{ gridColumn: '1/-1', fontSize: '.55rem' }}>Create User</button>
        </div>
      )}

      <div style={{ border: '1px solid rgba(201,150,58,.08)', borderRadius: 4 }}>
        {users.map(u => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.4rem .6rem', borderBottom: '1px solid rgba(201,150,58,.05)', fontSize: '.72rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.role === 'admin' ? '#C9963A' : '#4ade80', display: 'inline-block' }} />
              <span style={{ color: '#F5EDD8' }}>{u.name || u.username}</span>
              <span className="atag" style={{ fontSize: '.42rem', padding: '.05rem .3rem', background: u.role === 'admin' ? 'rgba(201,150,58,.15)' : 'rgba(45,74,34,.3)' }}>
                {u.role}
              </span>
              <span style={{ color: 'rgba(245,237,216,.3)', fontSize: '.6rem' }}>@{u.username}</span>
            </div>
            {u.id !== 'admin' && (
              <button className="abtn abtn-d" onClick={() => handleDelete(u.id, u.username)} style={{ fontSize: '.45rem', padding: '.15rem .4rem' }}>🗑️</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ addToast, user }) {
  const isAdmin = user?.role === 'admin';

  const handleExportAll = async () => {
    const types = getContentTypes();
    const all = {};
    for (const [type] of Object.entries(types)) {
      all[type] = await loadItems(type);
    }
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ogere-cms-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    addToast('All data exported as JSON.', 'success');
  };

  const handleClearAll = async () => {
    if (!confirm('⚠ Delete ALL CMS data? This cannot be undone.')) return;
    if (!confirm('Absolutely sure?')) return;
    for (const [, def] of Object.entries(getContentTypes())) {
      await dbDelete(def.key);
    }
    await dbDelete('cms-media');
    addToast('All CMS data cleared. Refresh to see defaults.', 'warning');
  };

  if (!isAdmin) {
    return (
      <div>
        <h2 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', marginBottom: '.2rem' }}>⚙️ Settings</h2>
        <p style={{ color: 'rgba(245,237,216,.4)', fontSize: '.75rem', marginBottom: '1.2rem' }}>System configuration, data import/export, and maintenance.</p>
        <div className="asection" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🔒</div>
          <p style={{ color: 'rgba(245,237,216,.4)', fontSize: '.78rem' }}>Settings are restricted to administrators only.</p>
        </div>
        <AuditLogPanel />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', marginBottom: '.2rem' }}>⚙️ Settings</h2>
      <p style={{ color: 'rgba(245,237,216,.4)', fontSize: '.75rem', marginBottom: '1.2rem' }}>System configuration, user management, data import/export.</p>

      <UserManager addToast={addToast} />

      <div className="asection">
        <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem' }}>Authentication</h3>
        <div style={{ padding: '.5rem .7rem', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.1)', borderRadius: 3, display: 'inline-block', fontSize: '.72rem' }}>
          Default admin login: <strong>admin</strong> / <strong>ogere2026</strong>
          <br />Set <code style={{ background: 'rgba(201,150,58,.1)', padding: '.1rem .3rem', borderRadius: 2 }}>VITE_ADMIN_PASSWORD</code> in .env for backward compatibility
        </div>
      </div>

      <div className="asection">
        <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem' }}>Import Default Data</h3>
        <p style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.5)', marginBottom: '.5rem' }}>Restore seed content. Only works if no CMS data exists yet.</p>
        <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
          {[
            ['cms-kings', kings, 'Kings'], ['cms-gallery', photos, 'Gallery'],
            ['cms-news', STATIC_NEWS, 'News'], ['cms-events', STATIC_EVENTS, 'Events'],
            ['cms-diaspora-notable', notable, 'Notable Diaspora'],
            ['cms-diaspora-groups', diasporaGroups, 'Diaspora Groups'],
            ['cms-maplocations', MAP_LOCATIONS, 'Map Locations'],
          ].map(([key, data, label]) => (
            <button key={key} className="abtn abtn-o" onClick={async () => {
              const done = await importDefaults(key, data);
              addToast(done ? `Default data imported for ${label}.` : `${label} already has data.`, done ? 'success' : 'warning');
            }} style={{ fontSize: '.5rem', padding: '.25rem .5rem' }}>📥 {label}</button>
          ))}
        </div>
      </div>

      <div className="asection">
        <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem' }}>Export / Backup</h3>
        <p style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.5)', marginBottom: '.5rem' }}>Download all CMS data as a JSON file.</p>
        <button className="abtn abtn-p" onClick={handleExportAll}>📥 Export All Data</button>
      </div>

      <div className="asection" style={{ borderColor: 'rgba(181,69,27,.2)' }}>
        <h3 style={{ color: '#f87171', fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem' }}>⚠ Danger Zone</h3>
        <p style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.5)', marginBottom: '.5rem' }}>Clear all CMS data. Irreversible — export first!</p>
        <button className="abtn abtn-d" onClick={handleClearAll}>🗑️ Clear All CMS Data</button>
      </div>

      <AuditLogPanel />
    </div>
  );
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [showPuck, setShowPuck] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(['operations', 'content', 'submissions']);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showMediaLib, setShowMediaLib] = useState(false);
  const [mediaFieldKey, setMediaFieldKey] = useState(null);
  const [formMediaKey, setFormMediaKey] = useState(null);

  const { addToast, toastContainer } = useToast();
  const contentTypes = getContentTypes();

  const refreshItems = useCallback(async () => {
    if (activeSection === 'dashboard' || activeSection === 'settings' || activeSection === 'media' || activeSection === 'eventCalendar' || !contentTypes[activeSection]) return;
    setLoading(true);
    const data = await loadItems(activeSection);
    setItems(data || []);
    setLoading(false);
  }, [activeSection]);

  const refreshStats = useCallback(async () => {
    setStats(await getStats());
  }, []);

  useEffect(() => { if (auth) refreshStats(); }, [auth, refreshStats]);
  useEffect(() => { if (auth) refreshItems(); }, [auth, activeSection, refreshItems]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowGlobalSearch(true); }
    };
    const quickAddHandler = () => { handleAdd(); };
    window.addEventListener('keydown', handler);
    window.addEventListener('cms-quick-add', quickAddHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('cms-quick-add', quickAddHandler);
    };
  }, []);

  const handleAdd = () => { setEditIndex(-1); setFormOpen(true); };
  const handleEdit = (idx) => { setEditIndex(idx); setFormOpen(true); };
  const handleSave = () => { setFormOpen(false); setEditIndex(-1); refreshItems(); refreshStats(); };

  const handleOpenPuck = (item) => {
    setFormOpen(false);
    setShowPuck(true);
  };

  const handlePuckSave = async (data) => {
    const updatedItems = [...items];
    updatedItems[editIndex] = { ...updatedItems[editIndex], data };
    await saveItems(activeSection, updatedItems);
    await addAuditLog({ action: `updated visual layout for ${updatedItems[editIndex].title}`, type: activeSection });
    addToast('Visual layout saved.', 'success');
    setShowPuck(false);
    setEditIndex(-1);
    refreshItems();
  };

  const toggleMenu = (id) => {
    setExpandedMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const currentDef = contentTypes[activeSection];
  const isSub = isSubmissionType(activeSection);

  const handleOpenMedia = (fieldKey) => {
    setMediaFieldKey(fieldKey);
    setFormMediaKey(fieldKey);
    setShowMediaLib(true);
  };

  if (!auth) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'linear-gradient(160deg,#1a0d06,#2c1a0e 50%,#0d0704)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}>
        <div style={{ maxWidth: 380, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.3rem' }}>🏛️</div>
            <div className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.3em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.1rem' }}>Ogere Remo</div>
            <h1 className="playfair" style={{ fontSize: '1.5rem', color: '#F5EDD8', fontWeight: 700 }}>Content Management</h1>
            <p style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.35)', marginTop: '.2rem' }}>OCDA Administration Portal</p>
          </div>
          <div style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.5rem' }}>
            <div className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.5rem' }}>🔐 Account Login</div>
            {loginError && <div style={{ fontSize: '.68rem', color: '#f87171', marginBottom: '.5rem', padding: '.3rem .5rem', background: 'rgba(220,38,38,.1)', borderRadius: 3 }}>{loginError}</div>}
            <div style={{ display: 'grid', gap: '.5rem' }}>
              <input className="ainp" value={loginUser} onChange={e => setLoginUser(e.target.value)}
                placeholder="Username" autoFocus />
              <input type="password" className="ainp" value={loginPw} onChange={e => setLoginPw(e.target.value)}
                placeholder="Password"
                onKeyDown={async e => { if (e.key === 'Enter') { const u = await authenticateUser(loginUser, loginPw); if (u) { setUser(u); setAuth(true); setLoginError(''); } else { setLoginError('Invalid username or password.'); } }}} />
            </div>
            <button className="abtn abtn-p" style={{ width: '100%', marginTop: '.8rem' }}
              onClick={async () => { const u = await authenticateUser(loginUser, loginPw); if (u) { setUser(u); setAuth(true); setLoginError(''); } else { setLoginError('Invalid username or password.'); } }}>
              Login →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#0d0704',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Libre Baskerville',serif",
      color: '#F5EDD8',
    }}>
      <div style={{
        height: 44, background: '#1a0d06', borderBottom: '1px solid rgba(201,150,58,.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 .8rem', flexShrink: 0,
      }}>
        <div className="cinzel" style={{ fontSize: '.65rem', color: '#C9963A', letterSpacing: '.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          🏛️ OGERE REMO CMS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <button className="abtn abtn-o" onClick={() => setShowGlobalSearch(true)} style={{ fontSize: '.5rem', padding: '.25rem .5rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
            🔍 Search <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '.45rem', border: '1px solid rgba(255,255,255,.15)', borderRadius: 2, padding: '.05rem .25rem' }}>Ctrl+K</span>
          </button>
          <button className="abtn abtn-o" onClick={() => { setShowMediaLib(true); setMediaFieldKey(null); }} style={{ fontSize: '.5rem', padding: '.25rem .5rem' }}>🖼️ Media</button>
          <a href="/" className="abtn abtn-o" style={{ fontSize: '.5rem', padding: '.25rem .5rem', textDecoration: 'none' }}>← Site</a>
          {user && (
            <span style={{ fontSize: '.6rem', color: 'rgba(245,237,216,.45)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.role === 'admin' ? '#C9963A' : '#4ade80', display: 'inline-block' }} />
              {user.name || user.username}
              <span className="atag" style={{ fontSize: '.42rem', padding: '.05rem .3rem', background: user.role === 'admin' ? 'rgba(201,150,58,.15)' : 'rgba(45,74,34,.3)', border: `1px solid ${user.role === 'admin' ? 'rgba(201,150,58,.3)' : 'rgba(45,74,34,.4)'}`, color: user.role === 'admin' ? '#C9963A' : '#a8d88e' }}>
                {user.role}
              </span>
            </span>
          )}
          <button className="abtn abtn-d" onClick={() => setAuth(false)} style={{ fontSize: '.5rem', padding: '.25rem .5rem' }}>Logout</button>
        </div>
      </div>

      <div className="admin-layout">
        <div className="admin-sidebar">
          {SIDEBAR_SECTIONS.map(section => (
            <div key={section.id}>
              {section.children ? (
                <>
                  <div onClick={() => toggleMenu(section.id)}
                    style={{
                      padding: '.4rem .7rem', cursor: 'pointer',
                      fontFamily: "'Cinzel',serif", fontSize: '.5rem', letterSpacing: '.08em',
                      color: '#C9963A', textTransform: 'uppercase',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(201,150,58,.05)',
                    }}>
                    <span>{section.icon} {section.label}</span>
                    <span style={{ fontSize: '.45rem', transition: 'transform .2s', transform: expandedMenus.includes(section.id) ? 'rotate(90deg)' : '' }}>▶</span>
                  </div>
                  {expandedMenus.includes(section.id) && section.children.map(child => (
                    <div key={child.id} onClick={() => setActiveSection(child.id)}
                      style={{
                        padding: '.28rem .7rem .28rem 1.5rem', cursor: 'pointer',
                        fontSize: '.68rem', color: activeSection === child.id ? '#C9963A' : 'rgba(245,237,216,.5)',
                        background: activeSection === child.id ? 'rgba(201,150,58,.07)' : 'none',
                        borderLeft: activeSection === child.id ? '2px solid #C9963A' : '2px solid transparent',
                        transition: 'all .12s',
                      }}>
                      {child.icon} {child.label}
                    </div>
                  ))}
                </>
              ) : (
                <div onClick={() => setActiveSection(section.id)}
                  style={{
                    padding: '.4rem .7rem', cursor: 'pointer',
                    fontFamily: "'Cinzel',serif", fontSize: '.5rem', letterSpacing: '.08em',
                    color: activeSection === section.id ? '#C9963A' : 'rgba(245,237,216,.45)',
                    background: activeSection === section.id ? 'rgba(201,150,58,.07)' : 'none',
                    textTransform: 'uppercase',
                    borderLeft: activeSection === section.id ? '2px solid #C9963A' : '2px solid transparent',
                    borderBottom: '1px solid rgba(201,150,58,.05)',
                  }}>
                  {section.icon} {section.label}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="admin-content">
          {activeSection === 'dashboard' && <DashboardHome stats={stats} onNavigate={setActiveSection} addToast={addToast} />}

          {activeSection === 'eventCalendar' && (
            <div>
              <h2 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', marginBottom: '.3rem' }}>🗓️ Event Calendar</h2>
              <p style={{ color: 'rgba(245,237,216,.4)', fontSize: '.72rem', marginBottom: '1rem' }}>Visual calendar view — click a day to add, click an event to edit.</p>
              <EventCalendar addToast={addToast} onListView={() => setActiveSection('events')} />
            </div>
          )}

          {activeSection === 'media' && (
            <div>
              <h2 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', marginBottom: '.3rem' }}>🖼️ Media Library</h2>
              <p style={{ color: 'rgba(245,237,216,.4)', fontSize: '.72rem', marginBottom: '1rem' }}>Manage reusable image URLs for your content.</p>
              <MediaLibrary standalone onClose={() => window.location.reload()} addToast={addToast} onSelect={() => {}} />
            </div>
          )}

          {activeSection === 'settings' && <SettingsPanel addToast={addToast} user={user} />}

          {currentDef && activeSection !== 'dashboard' && activeSection !== 'settings' && activeSection !== 'media' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '.4rem' }}>
                <div>
                  <h2 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', marginBottom: '.05rem' }}>
                    {currentDef.icon} {currentDef.label}
                  </h2>
                  <p style={{ color: 'rgba(245,237,216,.35)', fontSize: '.68rem' }}>
                    {isSub ? 'User-submitted content' : `Key: ${currentDef.key}`} · {items.length} items
                    {!isSub && ' · Edits reflect on frontend after refresh'}
                  </p>
                </div>
              </div>

              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(245,237,216,.25)' }}>⏳ Loading...</div>
              ) : isSub ? (
                <SubmissionListView type={activeSection} def={currentDef} items={items} onRefresh={refreshItems} addToast={addToast} />
              ) : (
                <ContentListView type={activeSection} def={currentDef} items={items} onRefresh={refreshItems} onEdit={handleEdit} onAdd={handleAdd} addToast={addToast} />
              )}
            </div>
          )}
        </div>
      </div>

      {formOpen && currentDef && (
        <ContentForm
          type={activeSection} def={currentDef}
          item={editIndex >= 0 ? items[editIndex] : null}
          index={editIndex}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditIndex(-1); }}
          addToast={addToast}
          onOpenMedia={handleOpenMedia}
          onOpenPuck={handleOpenPuck}
        />
      )}

      {showPuck && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: '#000' }}>
          <div style={{ height: 44, background: '#1a0d06', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', borderBottom: '1px solid rgba(201,150,58,.2)' }}>
            <div style={{ fontSize: '.7rem', color: '#C9963A', fontFamily: "'Cinzel',serif" }}>✨ Visual Editor: {items[editIndex]?.title}</div>
            <button className="abtn abtn-d" onClick={() => setShowPuck(false)} style={{ fontSize: '.5rem', padding: '.25rem .5rem' }}>✕ Close without saving</button>
          </div>
          <PuckEditor data={items[editIndex]?.data} onSave={handlePuckSave} />
        </div>
      )}

      {showGlobalSearch && (
        <GlobalSearch onClose={() => setShowGlobalSearch(false)} onNavigate={setActiveSection} addToast={addToast} />
      )}

      {showMediaLib && (
        <MediaLibrary onClose={() => { setShowMediaLib(false); setMediaFieldKey(null); }} addToast={addToast}
          onSelect={mediaFieldKey ? (url) => {
            if (mediaFieldKey) {
              const event = new CustomEvent('cms-media-select', { detail: { key: mediaFieldKey, url } });
              window.dispatchEvent(event);
            }
          } : undefined}
        />
      )}

      {toastContainer}
    </div>
  );
}
