import { Flame, Lock, Award } from 'lucide-react';
import { MILESTONES } from '../../utils/constants';
import { nextMilestone } from '../../utils/streakUtils';
export const AchievementCard = ({ days, unlocked }) => <div className={'badge' + (unlocked ? ' unlocked' : '')}><span className="badge-ico">{unlocked ? <Award size={26} /> : <Lock size={22} />}</span><strong>{days} days</strong><span className="muted small">{unlocked ? 'Unlocked' : 'Locked'}</span></div>;
export function AchievementList({ achievements = [], limit }) {
  const map = Object.fromEntries(achievements.map(a => [a.days, a.unlocked]));
  const list = MILESTONES.map(d => ({ days: d, unlocked: !!map[d] }));
  const shown = limit ? list.filter(a => a.unlocked).slice(-limit) : list;
  return shown.length ? <div className="badges">{shown.map(a => <AchievementCard key={a.days} {...a} />)}</div> : <p className="muted">No badges unlocked yet. Your first is at 3 days.</p>;
}
export function StreakDisplay({ current = 0, best = 0 }) {
  const next = nextMilestone(current);
  return <div className="card"><div className="streaks"><div><Flame color="#f2a65a" /><b>{current}</b><span className="muted small">Current streak</span></div><div><Award color="#7c5cdb" /><b>{best}</b><span className="muted small">Best streak</span></div></div>
    {next ? <><div className="bar"><i style={{ width: next.pct + '%', background: '#7c5cdb' }} /></div><p className="muted small">{next.remaining} more day{next.remaining > 1 ? 's' : ''} to reach {next.days} days</p></> : <p className="muted small">All milestones reached!</p>}</div>;
}
