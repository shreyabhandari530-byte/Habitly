import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, CalendarDays, BarChart3, Trophy, Sprout } from 'lucide-react';
import { ConnectionStatus } from '../common/ConnectionStatus.jsx';
const items = [['/', 'Dashboard', LayoutDashboard], ['/habits', 'My Habits', ListChecks], ['/calendar', 'Calendar', CalendarDays], ['/analytics', 'Analytics', BarChart3], ['/achievements', 'Achievements', Trophy]];
export default function Sidebar({ status }) {
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark"><Sprout size={20} /></span><strong>Habitly</strong></div>
    <nav>{items.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
    <ConnectionStatus status={status} />
  </aside>;
}
