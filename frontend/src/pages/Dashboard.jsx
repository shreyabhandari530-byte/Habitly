import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, CheckCircle2, Clock, Percent, Flame, Award } from 'lucide-react';
import useHabits from '../hooks/useHabits';
import { useStatistics, useAsync } from '../hooks/useStatistics';
import { habitService } from '../services/habitService';
import { achievementService } from '../services/achievementService';
import { WelcomeCard, StatsCard, WeeklyProgress, MotivationCard } from '../components/dashboard/DashboardParts.jsx';
import HabitList from '../components/habits/HabitList.jsx';
import HabitModal from '../components/habits/HabitModal.jsx';
import { AchievementList } from '../components/achievements/Achievements.jsx';
import { nextMilestone } from '../utils/streakUtils';
import { ConfirmDialog, Async, EmptyState, Loader, ErrorMessage } from '../components/common/Common.jsx';
import { fmt } from '../utils/format';
import { isScheduled, today } from '../utils/dateUtils';
export default function Dashboard() {
  const h = useHabits(); const stats = useStatistics();
  const mot = useAsync(habitService.motivation), ach = useAsync(achievementService.get);
  const [modal, setModal] = useState(null); const [del, setDel] = useState(null);
  const todays = h.habits.filter(x => isScheduled(x, today()));
  const s = stats.data || {};
  return <div className="page">
    <WelcomeCard onAdd={() => setModal({})} />
    <Async state={stats}>{() => <>
      <div className="grid-4"><StatsCard icon={ListChecks} label="Total habits" value={s.totalHabits} color="#7c5cdb" /><StatsCard icon={CheckCircle2} label="Completed today" value={s.completedToday} color="#3fa66f" /><StatsCard icon={Clock} label="Pending" value={s.pendingToday} color="#e08a3c" /><StatsCard icon={Percent} label="Daily completion" value={fmt(s.completionPercentage, '%')} color="#5b8def" pct={s.completionPercentage ?? 0} /></div>
      <div className="grid-2"><StatsCard icon={Flame} label="Current streak" value={fmt(s.currentStreak, ' days')} color="#e08a3c" /><StatsCard icon={Award} label="Best streak" value={fmt(s.bestStreak, ' days')} color="#7c5cdb" /></div></>}</Async>
    <div className="grid-main">
      <section className="card"><h3>Today's habits</h3>{h.loading ? <Loader /> : h.error && !h.habits.length ? <ErrorMessage message={h.error} onRetry={h.reload} /> : todays.length ? <HabitList habits={todays} onToggle={h.toggle} onEdit={setModal} onDelete={setDel} /> : h.habits.length ? <EmptyState title="Nothing scheduled today" text="None of your habits are scheduled for today." /> : <EmptyState title="No habits yet" text="Create your first habit to start tracking." action={<button className="btn primary" onClick={() => setModal({})}>Add habit</button>} />}</section>
      <MotivationCard motivation={mot.data} stats={s} />
    </div>
    <div className="grid-2">
      <section className="card"><h3>Weekly progress</h3><WeeklyProgress weekly={s.weekly} /></section>
      <section className="card"><div className="row-between"><h3>Recent achievements</h3><Link to="/achievements" className="link">View all</Link></div>
        <Async state={ach}>{a => { const n = nextMilestone(a?.currentStreak || 0); return <><AchievementList achievements={a?.achievements} limit={3} />{n && <p className="muted small">Next milestone: {n.days} days ({n.remaining} to go)</p>}</>; }}</Async></section>
    </div>
    {modal && <HabitModal habit={modal.id ? modal : null} onSave={h.save} onClose={() => setModal(null)} />}
    {del && <ConfirmDialog title="Delete habit?" text={`“${del.title}” and its history will be removed.`} onConfirm={async () => { await h.remove(del.id); setDel(null); }} onCancel={() => setDel(null)} />}
  </div>;
}
