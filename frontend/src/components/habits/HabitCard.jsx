import { useState } from 'react';
import { Pencil, Trash2, Flame, Check, ChevronDown } from 'lucide-react';
import { CAT_COLORS, WEEKDAYS } from '../../utils/constants';
export const HabitCategory = ({ name }) => <span className="chip" style={{ '--c': CAT_COLORS[name] || CAT_COLORS.Other }}>{name}</span>;
export const HabitCheckbox = ({ checked, onChange, label }) => <button className={'check' + (checked ? ' on' : '')} role="checkbox" aria-checked={checked} aria-label={label} onClick={onChange}>{checked && <Check size={15} strokeWidth={3} />}</button>;
export default function HabitCard({ habit, onToggle, onEdit, onDelete, detailed }) {
  const [open, setOpen] = useState(false);
  return <div className={'habit' + (habit.completedToday ? ' done' : '')}>
    <div className="habit-row">
      <HabitCheckbox checked={!!habit.completedToday} onChange={() => onToggle(habit)} label={`Mark ${habit.title} complete`} />
      <div className="habit-main"><strong>{habit.title}</strong><div className="habit-meta"><HabitCategory name={habit.category} />{habit.streak > 0 && <span className="streak"><Flame size={14} />{habit.streak}d</span>}<span className="muted small">{habit.completedToday ? 'Completed' : 'Pending'}</span></div></div>
      {detailed && <button className="icon-btn" aria-label="Details" onClick={() => setOpen(!open)}><ChevronDown size={18} className={open ? 'flip' : ''} /></button>}
      <button className="icon-btn" aria-label="Edit" onClick={() => onEdit(habit)}><Pencil size={16} /></button>
      <button className="icon-btn" aria-label="Delete" onClick={() => onDelete(habit)}><Trash2 size={16} /></button>
    </div>
    {open && <div className="habit-detail"><p>{habit.description || 'No description added.'}</p><p className="muted small">Starts {habit.start_date} · {(habit.weekdays || []).map(d => WEEKDAYS[d]).join(', ') || 'Every day'}</p></div>}
  </div>;
}
