import { useAsync } from '../hooks/useStatistics';
import { achievementService } from '../services/achievementService';
import { Async } from '../components/common/Common.jsx';
import { AchievementList, StreakDisplay } from '../components/achievements/Achievements.jsx';
export default function Achievements() {
  const a = useAsync(achievementService.get);
  return <div className="page"><h1>Achievements</h1><Async state={a}>{d => <>
    <StreakDisplay current={d?.currentStreak} best={d?.longestStreak} />
    <section className="card"><h3>Milestones</h3><AchievementList achievements={d?.achievements} /></section>
    <section className="card"><h3>Individual habit streaks</h3>{d?.habitStreaks?.length ? d.habitStreaks.map(s => <div className="day-habit" key={s.id}><span>{s.title}</span><b>{s.streak} days</b></div>) : <p className="muted">Complete a habit to start a streak.</p>}</section></>}</Async></div>;
}
