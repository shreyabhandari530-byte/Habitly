import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { useAsync } from '../../hooks/useStatistics';
import { habitService } from '../../services/habitService';
import { Async } from '../common/Common.jsx';
import { iso, today } from '../../utils/dateUtils';
import { WEEKDAYS } from '../../utils/constants';
export const CalendarDay = ({ date, entry, selected, onClick }) => {
  const missed = entry && date < today() && entry.total > entry.completed;
  return <button className={'cal-day' + (selected ? ' sel' : '') + (date === today() ? ' today' : '')} onClick={onClick}><span>{+date.slice(8)}</span>{entry?.total > 0 && <i className={entry.completed === entry.total ? 'ok' : missed ? 'miss' : 'part'}>{entry.percentage ?? Math.round(entry.completed / entry.total * 100)}%</i>}</button>;
};
export default function HabitCalendar() {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [sel, setSel] = useState(today());
  const from = iso(month), to = iso(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const fn = useCallback(() => habitService.history({ from, to }), [from, to]);
  const state = useAsync(fn);
  const shift = n => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  return <Async state={state}>{data => {
    data = data || [];
    const map = Object.fromEntries(data.map(d => [d.date, d]));
    const blanks = month.getDay(), days = +to.slice(8);
    const done = data.reduce((s, d) => s + d.completed, 0), sched = data.reduce((s, d) => s + d.total, 0);
    const detail = map[sel];
    return <div className="grid-cal">
      <div className="card"><div className="cal-head"><button className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)}><ChevronLeft /></button><h3>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3><button className="icon-btn" aria-label="Next month" onClick={() => shift(1)}><ChevronRight /></button></div>
        <div className="cal-grid">{WEEKDAYS.map(d => <div key={d} className="cal-dow">{d}</div>)}{Array.from({ length: blanks }, (_, i) => <div key={'b' + i} />)}{Array.from({ length: days }, (_, i) => { const date = `${from.slice(0, 8)}${String(i + 1).padStart(2, '0')}`; return <CalendarDay key={date} date={date} entry={map[date]} selected={sel === date} onClick={() => setSel(date)} />; })}</div>
        <p className="muted small">This month: {done} of {sched} scheduled check-ins completed ({sched ? Math.round(done / sched * 100) : 0}%)</p></div>
      <div className="card"><h3>{sel}</h3>{detail?.habits?.length ? detail.habits.map(h => <div key={h.id} className="day-habit">{h.completed ? <Check size={16} color="#3fa66f" /> : <X size={16} color="#e08a3c" />}<span>{h.title}</span><span className="muted small">{h.completed ? 'Completed' : sel < today() ? 'Missed' : 'Pending'}</span></div>) : <p className="muted">No habits were scheduled on this day.</p>}</div></div>;
  }}</Async>;
}
