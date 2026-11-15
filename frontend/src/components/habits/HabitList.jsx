import HabitCard from './HabitCard.jsx';
export default function HabitList({ habits, ...rest }) { return <div className="habit-list">{habits.map(h => <HabitCard key={h.id} habit={h} {...rest} />)}</div>; }
