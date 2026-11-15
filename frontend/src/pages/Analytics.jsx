import { useStatistics, useAsync } from '../hooks/useStatistics';
import { analyticsService } from '../services/analyticsService';
import { Async, EmptyState } from '../components/common/Common.jsx';
import { WeeklyChart, ProgressChart, CategoryAnalytics, ActivityHeatmap } from '../components/analytics/Charts.jsx';
import { WeeklyProgress } from '../components/dashboard/DashboardParts.jsx';
export default function Analytics() {
  const stats = useStatistics(), cats = useAsync(analyticsService.categories), heat = useAsync(analyticsService.heatmap);
  return <div className="page"><h1>Analytics</h1>
    <Async state={stats}>{s => <div className="grid-2">
      <section className="card"><h3>Daily completed vs pending</h3><WeeklyProgress weekly={s?.weekly} /></section>
      <section className="card"><h3>Weekly performance trend</h3><WeeklyChart weekly={s?.weekly} /></section>
      <section className="card"><h3>Habit-wise progress</h3>{s?.habitProgress?.length ? <ProgressChart items={s.habitProgress} /> : <p className="muted">No habit data yet.</p>}</section></div>}</Async>
    <section className="card"><h3>Category analytics</h3><Async state={cats}>{d => d?.length ? <CategoryAnalytics data={d} /> : <p className="muted">Add habits to see category analytics.</p>}</Async></section>
    <section className="card"><h3>Activity, last 12 months</h3><Async state={heat}>{d => d?.length ? <ActivityHeatmap data={d} /> : <EmptyState title="No activity yet" text="Complete a habit to start filling your heatmap." />}</Async></section></div>;
}
