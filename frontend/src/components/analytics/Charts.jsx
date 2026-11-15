import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { CAT_COLORS } from '../../utils/constants';
import { iso } from '../../utils/dateUtils';
export const WeeklyChart = ({ weekly = [] }) => <div className="chart"><ResponsiveContainer><LineChart data={weekly}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece8f8" /><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis unit="%" domain={[0, 100]} tickLine={false} axisLine={false} width={40} /><Tooltip /><Legend /><Line type="monotone" dataKey="percentage" name="Completion %" stroke="#7c5cdb" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div>;
export const ProgressChart = ({ items = [] }) => <div>{items.map(i => <div key={i.title} className="prog"><div className="prog-top"><span>{i.title}</span><b>{i.percentage}%</b></div><div className="bar"><i style={{ width: i.percentage + '%', background: '#7c5cdb' }} /></div></div>)}</div>;
export function CategoryAnalytics({ data = [] }) {
  const best = [...data].sort((a, b) => b.percentage - a.percentage)[0];
  return <><div className="grid-2"><div className="chart"><ResponsiveContainer><PieChart><Pie data={data} dataKey="total" nameKey="category" innerRadius={50} outerRadius={85} paddingAngle={2}>{data.map(d => <Cell key={d.category} fill={CAT_COLORS[d.category] || '#9a97ad'} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
    <div className="chart"><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece8f8" /><XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} /><Tooltip /><Legend /><Bar dataKey="completed" name="Completed" fill="#7c5cdb" radius={[4, 4, 0, 0]} /><Bar dataKey="pending" name="Pending" fill="#e3dcf8" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
    {best && <p className="muted">Most consistent category: <b style={{ color: CAT_COLORS[best.category] }}>{best.category}</b> ({best.percentage}%)</p>}
    <div className="cat-cards">{data.map(c => <div className="card" key={c.category}><strong>{c.category}</strong><div className="muted small">{c.total} habits · {c.completed} done · {c.pending} pending</div><div className="bar"><i style={{ width: c.percentage + '%', background: CAT_COLORS[c.category] }} /></div><div className="small">{c.percentage}% complete</div></div>)}</div></>;
}
export function ActivityHeatmap({ data = [] }) {
  const [sel, setSel] = useState(null);
  const map = Object.fromEntries(data.map(d => [d.date, d]));
  const end = new Date(); const start = new Date(end); start.setDate(end.getDate() - 364 - start.getDay());
  const cells = []; for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) cells.push(iso(d));
  const lvl = e => !e || !e.count ? 0 : e.percentage >= 100 ? 4 : e.percentage >= 66 ? 3 : e.percentage >= 33 ? 2 : 1;
  const totalDone = data.reduce((s, d) => s + (d.count || 0), 0), active = data.filter(d => d.count > 0).length;
  return <div><div className="heat-wrap"><div className="heat">{cells.map(c => { const e = map[c]; return <button key={c} className={'cell l' + lvl(e)} title={`${c}: ${e?.count || 0} done (${e?.percentage || 0}%)`} onClick={() => setSel({ date: c, ...(e || { count: 0, percentage: 0 }) })} aria-label={c} />; })}</div></div>
    <div className="heat-foot"><span className="muted small">{totalDone} completions · {active} active days in the last 12 months</span><span className="legend small muted">Less {[0, 1, 2, 3, 4].map(l => <i key={l} className={'cell l' + l} />)} More</span></div>
    {sel && <p className="heat-sel"><b>{sel.date}</b>: {sel.count} completed, {sel.percentage}% of scheduled habits</p>}</div>;
}
