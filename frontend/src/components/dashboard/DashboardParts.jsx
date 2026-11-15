import { Plus } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { longDate } from '../../utils/dateUtils';
import { QUOTES } from '../../utils/constants';
export const QuickActions = ({ onAdd }) => <button className="btn primary" onClick={onAdd}><Plus size={17} />Add habit</button>;
export const WelcomeCard = ({ onAdd }) => <div className="welcome"><div><h1>Welcome back 👋</h1><p>{longDate(new Date())}. Show up for one habit at a time.</p></div><QuickActions onAdd={onAdd} /></div>;
export const StatsCard = ({ icon: Icon, label, value, color, pct }) => <div className="card stat"><span className="stat-ico" style={{ background: color + '22', color }}><Icon size={20} /></span><div><div className="muted small">{label}</div><div className="stat-val">{value ?? '–'}</div></div>{pct != null && <div className="bar"><i style={{ width: pct + '%', background: color }} /></div>}</div>;
export function WeeklyProgress({ weekly = [] }) {
  const data = weekly.map(d => ({ ...d, pending: Math.max((d.total || 0) - (d.completed || 0), 0) }));
  if (!data.length) return <p className="muted">No weekly data yet.</p>;
  return <><div className="chart"><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece8f8" /><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} /><Tooltip /><Legend /><Bar dataKey="completed" name="Completed" stackId="a" fill="#7c5cdb" /><Bar dataKey="pending" name="Pending" stackId="a" fill="#e3dcf8" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
    <div className="pcts">{data.map(d => <span key={d.day}><b>{d.percentage ?? 0}%</b>{d.day}</span>)}</div></>;
}
export function MotivationCard({ motivation, stats }) {
  const total = stats?.totalHabits || 0, pending = stats?.pendingToday ?? 0;
  const msg = !total ? 'Add your first habit to start your streak.' : pending === 0 ? 'All scheduled habits done today. Great work!' : `${pending} habit${pending > 1 ? 's' : ''} still pending today. You can finish them.`;
  return <div className="card motivation"><h3>Daily motivation</h3><blockquote>“{motivation?.quote || QUOTES[new Date().getDate() % QUOTES.length]}”{motivation?.author && <cite> — {motivation.author}</cite>}</blockquote><p>{msg}</p></div>;
}
