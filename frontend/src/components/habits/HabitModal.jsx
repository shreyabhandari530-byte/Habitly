import { useState } from 'react';
import { Modal } from '../common/Common.jsx';
import { CATEGORIES, WEEKDAYS } from '../../utils/constants';
import { today } from '../../utils/dateUtils';
import { validateHabit, buildHabitPayload, HABIT_RULES } from '../../services/apiContract';
export function HabitForm({ habit, onSubmit, onCancel }) {
  const [f, setF] = useState({ title: habit?.title || '', description: habit?.description || '', category: habit?.category || CATEGORIES[0], start_date: habit?.start_date || today(), weekdays: habit?.weekdays?.length ? habit.weekdays : [0, 1, 2, 3, 4, 5, 6] });
  const [err, setErr] = useState({}); const [busy, setBusy] = useState(false);
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setErr(p => ({ ...p, [k]: undefined })); };
  const day = d => set('weekdays', f.weekdays.includes(d) ? f.weekdays.filter(x => x !== d) : [...f.weekdays, d].sort());
  const submit = async e => {
    e.preventDefault(); if (busy) return;
    const x = validateHabit(f); setErr(x); if (Object.keys(x).length) return;
    setBusy(true);
    const r = await onSubmit(buildHabitPayload(f));
    if (r?.fieldErrors) setErr(r.fieldErrors); // validation errors returned by the server
    setBusy(false);
  };
  return <form onSubmit={submit} noValidate className="form">
    <label>Habit title<input value={f.title} maxLength={HABIT_RULES.titleMax + 20} onChange={e => set('title', e.target.value)} placeholder="e.g. Read 20 pages" aria-invalid={!!err.title} />{err.title && <span className="err">{err.title}</span>}</label>
    <label>Description<textarea rows={3} value={f.description} onChange={e => set('description', e.target.value)} placeholder="Why does this habit matter?" />{err.description && <span className="err">{err.description}</span>}</label>
    <div className="two"><label>Category<select value={f.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>{err.category && <span className="err">{err.category}</span>}</label>
      <label>Start date<input type="date" value={f.start_date} onChange={e => set('start_date', e.target.value)} />{err.start_date && <span className="err">{err.start_date}</span>}</label></div>
    <div><span className="label">Active weekdays</span><div className="days">{WEEKDAYS.map((d, i) => <button type="button" key={d} className={'day' + (f.weekdays.includes(i) ? ' on' : '')} aria-pressed={f.weekdays.includes(i)} onClick={() => day(i)}>{d}</button>)}</div>{err.weekdays && <span className="err">{err.weekdays}</span>}</div>
    <div className="modal-actions"><button type="button" className="btn" onClick={onCancel}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : habit ? 'Save changes' : 'Add habit'}</button></div>
  </form>;
}
export default function HabitModal({ habit, onSave, onClose }) {
  return <Modal title={habit ? 'Edit habit' : 'Add a new habit'} onClose={onClose}><HabitForm habit={habit} onCancel={onClose} onSubmit={async d => { const r = await onSave(d, habit?.id); if (r?.fieldErrors) return r; if (r !== null) onClose(); return r; }} /></Modal>;
}
